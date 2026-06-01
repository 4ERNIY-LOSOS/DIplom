import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTariffDto } from './dto/create-tariff.dto';
import { UpdateTariffDto } from './dto/update-tariff.dto';
import { Tariff } from './entities/tariff.entity';

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private tariffsRepository: Repository<Tariff>,
  ) {}

  create(dto: CreateTariffDto) {
    return this.tariffsRepository.save(dto);
  }

  findAll() {
    return this.tariffsRepository.find();
  }

  findOne(id: number) {
    return this.tariffsRepository.findOneBy({ id });
  }

  update(id: number, dto: UpdateTariffDto) {
    return this.tariffsRepository.update(id, dto);
  }

  remove(id: number) {
    return this.tariffsRepository.delete(id);
  }
}
