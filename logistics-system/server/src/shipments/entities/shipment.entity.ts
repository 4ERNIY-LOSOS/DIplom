import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  status!: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.shipments)
  vehicle!: Vehicle;

  @ManyToOne(() => Driver, (driver) => driver.shipments)
  driver!: Driver;

  @OneToMany(() => Order, (order) => order.shipment)
  orders!: Order[];
}
