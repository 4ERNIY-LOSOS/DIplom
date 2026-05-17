import { PartialType } from '@nestjs/mapped-types';
import { CreateClientContractDto } from './create-client_contract.dto';

export class UpdateClientContractDto extends PartialType(
  CreateClientContractDto,
) {}
