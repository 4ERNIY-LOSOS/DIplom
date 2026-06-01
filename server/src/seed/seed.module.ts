import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Company } from '../companies/entities/company.entity';
import { Order } from '../orders/entities/order.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Tariff } from '../tariffs/entities/tariff.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Company, Order, Vehicle, Driver, Tariff, Shipment]),
  ],
  providers: [SeedService],
  controllers: [SeedController],
})
export class SeedModule {}
