import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { AuditService } from '../auth/audit.service';
import { NotificationService } from '../auth/notification.service';
import { Order } from '../orders/entities/order.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentsRepository: Repository<Shipment>,
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Driver) private driversRepository: Repository<Driver>,
    private auditService: AuditService,
    private notificationService: NotificationService,
  ) {}

  async create(dto: {
    vehicleId: number;
    driverId: number;
    orderId?: number;
  }) {
    const vehicle = await this.vehiclesRepository.findOneBy({
      id: dto.vehicleId,
    });
    const driver = await this.driversRepository.findOneBy({ id: dto.driverId });

    if (!vehicle || !driver)
      throw new NotFoundException('Транспорт или водитель не найдены');

    const shipment = this.shipmentsRepository.create({
      vehicle,
      driver,
      status: 'Planned',
    });

    // Mark as busy
    await this.vehiclesRepository.update(vehicle.id, { status: 'busy' });
    await this.driversRepository.update(driver.id, { status: 'busy' });

    if (dto.orderId) {
      const order = await this.ordersRepository.findOneBy({ id: dto.orderId });
      if (!order) throw new NotFoundException('Заявка не найдена');
      shipment.orders = [order];
      const savedShipment = await this.shipmentsRepository.save(shipment);
      
      // Allow shipment assignment even if previously planned (e.g. splitting order)
      await this.ordersRepository.update(order.id, {
        status: 'Planned',
      });
      await this.auditService.logAction(
        'CREATE',
        'Shipment',
        savedShipment.id,
        `Created from order ${order.id}`,
      );
      return savedShipment;
    } else {
      throw new BadRequestException('Необходимо указать заявку');
    }
  }

  async updateStatus(id: number, status: string, userId?: number) {
    const shipment = await this.shipmentsRepository.findOne({
      where: { id },
      relations: ['orders'],
    });
    if (!shipment) throw new NotFoundException('Перевозка не найдена');

    await this.shipmentsRepository.update(id, { status });

    if (status === 'Delivered') {
        const fullShipment = await this.shipmentsRepository.findOne({
            where: { id },
            relations: ['vehicle', 'driver'],
        });
        if (fullShipment) {
            await this.vehiclesRepository.update(fullShipment.vehicle.id, { status: 'available' });
            await this.driversRepository.update(fullShipment.driver.id, { status: 'available' });
        }
    }

    if (shipment.orders) {
      const orderIds = shipment.orders.map((o) => o.id);
      await this.ordersRepository.update(orderIds, { status });
    }

    await this.auditService.logAction(
      'UPDATE_STATUS',
      'Shipment',
      id,
      `Status changed to ${status}`,
    );
    if (userId) {
      await this.notificationService.notify(
        userId,
        `Статус перевозки ${id} изменен на ${status}`,
      );
    }
    return this.shipmentsRepository.findOne({
      where: { id },
      relations: ['orders', 'vehicle', 'driver'],
    });
  }

  findAll() {
    return this.shipmentsRepository.find({
      relations: ['vehicle', 'driver', 'orders'],
    });
  }
  findOne(id: number) {
    return this.shipmentsRepository.findOne({
      where: { id },
      relations: ['vehicle', 'driver', 'orders'],
    });
  }
  remove(id: number) {
    return this.shipmentsRepository.delete(id);
  }
}
