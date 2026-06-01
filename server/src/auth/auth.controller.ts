import {
  Controller,
  Post,
  Body,
  Request,
  UnauthorizedException,
  UseGuards,
  Get,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { PasswordResetService } from './password-reset.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private passwordResetService: PasswordResetService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.usersService.findOne(req.user.id);
  }

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.registerClient(createUserDto);
  }

  @Post('password-reset/captcha')
  async getCaptcha() {
    return this.passwordResetService.generateCaptcha();
  }

  @Post('password-reset/request')
  async requestReset(@Body() body: { username: string, captchaId: string, captchaAnswer: number }) {
    // 1. Проверяем капчу
    if (!this.passwordResetService.verifyCaptcha(body.captchaId, body.captchaAnswer)) {
      throw new BadRequestException('Неверный ответ капчи');
    }

    const user = await this.usersService.findOneByUsername(body.username);
    if (!user) throw new NotFoundException('Пользователь не найден');

    const code = this.passwordResetService.generateCode(user.id);
    return { code }; // Временно отдаем код, как просил пользователь
  }

  @Post('password-reset/confirm')
  async confirmReset(@Body() body: { code: string; newPassword: string }) {
    const userId = this.passwordResetService.verifyCode(body.code);
    if (!userId) throw new BadRequestException('Неверный или просроченный код');

    const newPasswordHash = await bcrypt.hash(body.newPassword, 10);
    await this.usersService.updatePassword(userId, newPasswordHash);
    this.passwordResetService.deleteCode(body.code);

    return { message: 'Пароль успешно изменен' };
  }
}
