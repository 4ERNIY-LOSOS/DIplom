import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';
import { PasswordResetService } from './password-reset.service';
import { AuditLog } from '../audit_logs/entities/audit_log.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([AuditLog, Notification, User]),
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY',
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditService, NotificationService, PasswordResetService],
  exports: [AuthService, AuditService, NotificationService, PasswordResetService],
})
export class AuthModule {}
