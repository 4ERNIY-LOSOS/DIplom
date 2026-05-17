import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { AuthModule } from '../auth/auth.module';
import { DistanceService } from './distance.service';
import { ClientContract } from '../client_contracts/entities/client_contract.entity';
import { Tariff } from '../tariffs/entities/tariff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Shipment, ClientContract, Tariff]), AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService, DistanceService],
})
export class OrdersModule {}
