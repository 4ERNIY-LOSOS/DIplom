import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async verifyPassword(userId: number, pass: string): Promise<boolean> {
    const user = await this.usersService.findOne(userId);
    if (!user) return false;

    return await bcrypt.compare(pass, user.passwordHash);
  }

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role ? user.role.name : 'client',
      fullName: user.fullName,
      companyName: user.company?.name,
      companyId: user.company?.id,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
