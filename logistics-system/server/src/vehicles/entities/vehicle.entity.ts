import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  model!: string;

  @Column()
  plateNumber!: string;

  @Column({ default: 0 })
  capacity!: number; // Weight capacity in kg

  @Column({ default: 0 })
  volumeCapacity!: number; // Volume capacity in m3

  @Column({ default: 'available' })
  status!: string; // 'available' or 'busy'

  @OneToMany(() => Shipment, (shipment) => shipment.vehicle)
  shipments!: Shipment[];
}
