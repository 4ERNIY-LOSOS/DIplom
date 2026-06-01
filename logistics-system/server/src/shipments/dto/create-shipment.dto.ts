import { IsInt, IsOptional } from 'class-validator';

export class CreateShipmentDto {
  @IsInt()
  vehicleId!: number;

  @IsInt()
  driverId!: number;

  @IsInt()
  @IsOptional()
  orderId?: number;
}
