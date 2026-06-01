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
  licenseCategory!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ default: 'Свободен' })
  status!: string; // 'Свободен' or 'В рейсе'

  @OneToMany(() => Shipment, (shipment) => shipment.driver)
  shipments!: Shipment[];
}
