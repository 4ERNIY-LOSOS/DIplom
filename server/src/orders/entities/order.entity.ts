import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Cargo } from '../../cargos/entities/cargo.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cargoName!: string;

  @Column('decimal')
  weight!: number;

  @Column('decimal')
  volume!: number;

  @Column()
  category!: string; // хрупкое, обычное, опасное и т.д.

  @Column()
  originAddress!: string;

  @Column()
  destinationAddress!: string;

  @Column({ type: 'timestamp', nullable: true })
  pickupDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveryStartDate!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  deliveryEndDate!: Date | null;

  @Column({ default: 'В ожидании' })
  status!: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  distance!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  estimatedPrice!: number;

  @ManyToOne(() => Company, (company) => company.orders)
  company!: Company;

  @OneToMany(() => Cargo, (cargo) => cargo.order)
  cargos!: Cargo[];

  @ManyToOne(() => Shipment, (shipment) => shipment.orders, { nullable: true })
  shipment!: Shipment;
}
