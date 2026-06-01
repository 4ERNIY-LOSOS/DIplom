import { Injectable } from '@nestjs/common';
import { CreateClientContractDto } from './dto/create-client_contract.dto';
import { UpdateClientContractDto } from './dto/update-client_contract.dto';

@Injectable()
export class ClientContractsService {
  create(_createClientContractDto: CreateClientContractDto) {
    return 'This action adds a new clientContract';
  }

  findAll() {
    return `This action returns all clientContracts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clientContract`;
  }

  update(id: number, _updateClientContractDto: UpdateClientContractDto) {
    return `This action updates a #${id} clientContract`;
  }

  remove(id: number) {
    return `This action removes a #${id} clientContract`;
  }
}
