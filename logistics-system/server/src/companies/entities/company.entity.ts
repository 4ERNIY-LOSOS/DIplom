import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { ClientContract } from '../../client_contracts/entities/client_contract.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column()
  contactEmail!: string;

  @Column()
  taxId!: string;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => User, (user) => user.company)
  users!: User[];

  @OneToMany(() => Order, (order) => order.company)
  orders!: Order[];

  @OneToMany(() => ClientContract, (contract) => contract.company)
  contracts!: ClientContract[];
}
