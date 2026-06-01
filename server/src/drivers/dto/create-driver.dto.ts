import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  @IsNotEmpty({ message: 'ФИО водителя обязательно' })
  fullName!: string;

  @IsString()
  @IsNotEmpty({ message: 'Номер водительского удостоверения обязателен' })
  licenseNumber!: string;

  @IsString()
  @IsOptional()
  @Matches(/^[78][0-9]{10}$/, { message: 'Телефон должен быть в формате 11 цифр, начиная с 7 или 8' })
  phone?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
