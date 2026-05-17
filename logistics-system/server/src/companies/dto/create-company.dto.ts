import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  @Matches(/^[0-9]{10,12}$/)
  taxId!: string;
}
