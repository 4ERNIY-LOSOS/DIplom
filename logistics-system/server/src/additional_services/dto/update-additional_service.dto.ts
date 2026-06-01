import { PartialType } from '@nestjs/mapped-types';
import { CreateAdditionalServiceDto } from './create-additional_service.dto';

export class UpdateAdditionalServiceDto extends PartialType(
  CreateAdditionalServiceDto,
) {}
