import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ClientContract } from '../../client_contracts/entities/client_contract.entity';

@Entity('tariffs')
export class Tariff {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column('decimal', { default: 0 })
  basePrice!: number;

  @Column('decimal', { default: 0 })
  pricePerKm!: number;

  @Column('decimal', { default: 0 })
  pricePerKg!: number;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => ClientContract, (contract) => contract.tariff)
  contracts!: ClientContract[];
}
