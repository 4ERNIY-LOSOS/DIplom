import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { DistanceService } from './distance.service';
import { Tariff } from '../tariffs/entities/tariff.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Tariff) private tariffRepository: Repository<Tariff>,
    private distanceService: DistanceService,
  ) {}

  async calculate(dto: any) {
    const { originAddress, destinationAddress, weight } = dto;
    if (!originAddress || !destinationAddress || !weight) {
      return { distance: 0, price: 0 };
    }

    const distance = await this.distanceService.getDistance(originAddress, destinationAddress);
    
    // Ищем любой активный тариф в системе
    const tariff = await this.tariffRepository.findOne({
      where: { isActive: true }
    });

    if (!tariff) {
      return { distance, price: 0, error: 'В системе нет активных тарифов. Обратитесь к администратору.' };
    }

    const price = Number(tariff.basePrice) + 
                  (distance * Number(tariff.pricePerKm)) + 
                  (Number(weight) * Number(tariff.pricePerKg));

    return { 
      distance, 
      price: Math.round(price * 100) / 100,
      tariffName: tariff.name
    };
  }

  async create(dto: any, user: any) {
    const calculation = await this.calculate(dto);
    
    const order = this.ordersRepository.create({
      ...dto,
      cargoName: `${user.fullName || 'Без имени'} (${user.companyName || 'Без компании'})`,
      pickupDate: null,
      company: user.companyId ? { id: user.companyId } : null,
      distance: calculation.distance,
      estimatedPrice: calculation.price,
    });
    return await this.ordersRepository.save(order);
  }

  async findAll(user: any) {
    if (user.role === 'logistician' || user.role === 'admin') {
      return this.ordersRepository.find({ relations: ['company', 'cargos'] });
    }
    return this.ordersRepository.find({
      where: { company: { id: user.companyId } },
      relations: ['company', 'cargos'],
    });
  }

  findOne(id: number) {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['company', 'cargos'],
    });
  }
  update(id: number, dto: any) {
    return this.ordersRepository.update(id, dto);
  }
  remove(id: number) {
    return this.ordersRepository.delete(id);
  }
}
