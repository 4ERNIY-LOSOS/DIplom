import { Injectable } from '@nestjs/common';

@Injectable()
export class AdditionalServicesService {
  create() {
    return 'This action adds a new additionalService';
  }

  findAll() {
    return `This action returns all additionalServices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} additionalService`;
  }

  update(id: number) {
    return `This action updates a #${id} additionalService`;
  }

  remove(id: number) {
    return `This action removes a #${id} additionalService`;
  }
}
