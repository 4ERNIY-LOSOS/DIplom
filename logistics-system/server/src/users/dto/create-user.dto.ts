import {
  IsString,
  IsNotEmpty,
  IsEmail,
  Matches,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Логин должен быть строкой' })
  @IsNotEmpty({ message: 'Логин обязателен' })
  username!: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  passwordHash!: string;

  @IsString({ message: 'ФИО должно быть строкой' })
  @Matches(/^[а-яёА-ЯЁa-zA-Z\s]+$/, {
    message: 'ФИО должно содержать только буквы',
  })
  @IsNotEmpty({ message: 'ФИО обязательно' })
  fullName!: string;

  @IsEmail({}, { message: 'Некорректный формат Email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email!: string;

  @IsString({ message: 'Телефон должен быть строкой' })
  @Matches(/^\+?[78][0-9]{10}$/, {
    message: 'Телефон должен содержать 11 цифр (начинаться с 7 или 8)',
  })
  @IsNotEmpty({ message: 'Телефон обязателен' })
  phone!: string;

  @IsString({ message: 'Название компании обязательно' })
  @IsNotEmpty({ message: 'Название компании обязательно' })
  companyName!: string;

  @IsOptional()
  @Matches(/^[0-9]{10,12}$/, { message: 'ИНН должен содержать 10 или 12 цифр' })
  taxId?: string;

  @IsOptional()
  roleId?: any;
}
