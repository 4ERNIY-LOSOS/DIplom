import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  fullName!: string;

  @Column()
  licenseNumber!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ default: 'available' })
  status!: string; // 'available' or 'busy'

  @OneToMany(() => Shipment, (shipment) => shipment.driver)
  shipments!: Shipment[];
}
