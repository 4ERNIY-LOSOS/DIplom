import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  fullName!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ nullable: true })
  phone!: string;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  role: Role | null = null;

  @ManyToOne(() => Company, (company) => company.users, { nullable: true })
  company: Company | null = null;
}
