import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateTariffDto {
  @IsString()
  @IsNotEmpty({ message: 'Название тарифа обязательно' })
  name!: string;

  @IsNumber()
  @Min(0, { message: 'Базовая цена не может быть отрицательной' })
  basePrice!: number;

  @IsNumber()
  @Min(0, { message: 'Цена за км не может быть отрицательной' })
  pricePerKm!: number;

  @IsNumber()
  @Min(0, { message: 'Цена за кг не может быть отрицательной' })
  pricePerKg!: number;

  @IsOptional()
  isActive?: boolean;
}
