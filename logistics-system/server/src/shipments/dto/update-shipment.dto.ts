import { PartialType } from '@nestjs/mapped-types';
import { CreateShipmentDto } from './create-shipment.dto';
import { IsString, IsOptional } from 'class-validator';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
  @IsString()
  @IsOptional()
  status?: string;
}
