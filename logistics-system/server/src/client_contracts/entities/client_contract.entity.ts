import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Tariff } from '../../tariffs/entities/tariff.entity';

@Entity('client_contracts')
export class ClientContract {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  contractNumber!: string;

  @Column()
  startDate!: Date;

  @Column()
  endDate!: Date;

  @ManyToOne(() => Company, (company) => company.contracts)
  company!: Company;

  @ManyToOne(() => Tariff, (tariff) => tariff.contracts)
  tariff!: Tariff;
}
