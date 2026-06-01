import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty({ message: 'Модель обязательна' })
  model!: string;

  @IsString()
  @IsNotEmpty({ message: 'Гос. номер обязателен' })
  plateNumber!: string;

  @IsNumber()
  @Min(0, { message: 'Грузоподъемность не может быть отрицательной' })
  capacity!: number;

  @IsNumber()
  @Min(0, { message: 'Объем не может быть отрицательным' })
  volumeCapacity!: number;
}
