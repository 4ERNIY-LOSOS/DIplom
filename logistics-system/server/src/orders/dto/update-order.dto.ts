import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  pickupDate?: Date;

  @IsOptional()
  @IsDateString()
  deliveryStartDate?: Date;

  @IsOptional()
  @IsDateString()
  deliveryEndDate?: Date;
}
