import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientContractsService } from './client_contracts.service';
import { CreateClientContractDto } from './dto/create-client_contract.dto';
import { UpdateClientContractDto } from './dto/update-client_contract.dto';

@Controller('client-contracts')
export class ClientContractsController {
  constructor(
    private readonly clientContractsService: ClientContractsService,
  ) {}

  @Post()
  create(@Body() createClientContractDto: CreateClientContractDto) {
    return this.clientContractsService.create(createClientContractDto);
  }

  @Get()
  findAll() {
    return this.clientContractsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientContractsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateClientContractDto: UpdateClientContractDto,
  ) {
    return this.clientContractsService.update(+id, updateClientContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientContractsService.remove(+id);
  }
}
