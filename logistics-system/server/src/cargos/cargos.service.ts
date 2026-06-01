import { Injectable } from '@nestjs/common';

@Injectable()
export class CargosService {
  create() {
    return 'This action adds a new cargo';
  }

  findAll() {
    return `This action returns all cargos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cargo`;
  }

  update(id: number) {
    return `This action updates a #${id} cargo`;
  }

  remove(id: number) {
    return `This action removes a #${id} cargo`;
  }
}
