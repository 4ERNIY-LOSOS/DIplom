import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  action!: string;

  @Column()
  entity!: string;

  @Column()
  entityId!: number;

  @Column({ nullable: true })
  details!: string;

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => User, { nullable: true })
  user!: User;
}
