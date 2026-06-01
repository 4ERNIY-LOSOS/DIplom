import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('cargos')
export class Cargo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  description!: string;

  @Column('decimal')
  weight!: number;

  @ManyToOne(() => Order, (order) => order.cargos)
  order!: Order;
}
