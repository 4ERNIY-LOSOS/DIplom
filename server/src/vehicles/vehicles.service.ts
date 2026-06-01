import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  create(dto: CreateVehicleDto) {
    return this.vehiclesRepository.save(dto);
  }
  findAll() {
    return this.vehiclesRepository.find();
  }
  findOne(id: number) {
    return this.vehiclesRepository.findOneBy({ id });
  }
  update(id: number, dto: UpdateVehicleDto) {
    return this.vehiclesRepository.update(id, dto);
  }
  remove(id: number) {
    return this.vehiclesRepository.delete(id);
  }
}
