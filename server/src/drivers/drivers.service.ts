import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
  ) {}

  create(dto: CreateDriverDto) {
    return this.driversRepository.save(dto);
  }
  findAll() {
    return this.driversRepository.find();
  }
  findOne(id: number) {
    return this.driversRepository.findOneBy({ id });
  }
  update(id: number, dto: UpdateDriverDto) {
    return this.driversRepository.update(id, dto);
  }
  remove(id: number) {
    return this.driversRepository.delete(id);
  }
}
