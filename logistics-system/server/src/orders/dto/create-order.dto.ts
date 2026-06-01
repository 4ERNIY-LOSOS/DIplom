import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { IsRealAddress } from './address.validator';

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  cargoName?: string;

  @IsNumber({}, { message: 'Вес должен быть числом' })
  @Min(0.01, { message: 'Вес должен быть больше 0' })
  @IsNotEmpty({ message: 'Вес обязателен' })
  weight!: number;

  @IsNumber({}, { message: 'Объем должен быть числом' })
  @Min(0.01, { message: 'Объем должен быть больше 0' })
  @IsNotEmpty({ message: 'Объем обязателен' })
  volume!: number;

  @IsString({ message: 'Категория обязательна' })
  @IsNotEmpty({ message: 'Категория обязательна' })
  category!: string;

  @IsString({ message: 'Адрес отправления обязателен' })
  @IsNotEmpty({ message: 'Адрес отправления обязателен' })
  @IsRealAddress({ message: 'Адрес отправления не найден' })
  originAddress!: string;

  @IsString({ message: 'Адрес назначения обязателен' })
  @IsNotEmpty({ message: 'Адрес назначения обязателен' })
  @IsRealAddress({ message: 'Адрес назначения не найден' })
  destinationAddress!: string;
}
