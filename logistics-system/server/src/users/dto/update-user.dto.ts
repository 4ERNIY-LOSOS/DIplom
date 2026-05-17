import {
  IsString,
  IsOptional,
  MinLength,
  IsEmail,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'ФИО должно быть строкой' })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат Email' })
  email?: string;

  @IsOptional()
  @Matches(/^\+?[78][0-9]{10}$/, {
    message: 'Телефон должен содержать 11 цифр (начинаться с 7 или 8)',
  })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Логин должен быть строкой' })
  username?: string;

  @IsOptional()
  @MinLength(3, { message: 'Новый пароль должен содержать минимум 3 символа' })
  newPassword?: string;

  @IsOptional()
  @IsString()
  oldPassword?: string;

  @IsOptional()
  @IsString()
  confirmNewPassword?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @Matches(/^[0-9]{10,12}$/, { message: 'ИНН должен содержать 10 или 12 цифр' })
  taxId?: string;

  @IsOptional()
  roleId?: any;
}
