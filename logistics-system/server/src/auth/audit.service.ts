import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../audit_logs/entities/audit_log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async logAction(
    action: string,
    entity: string,
    entityId: number,
    details: string,
    userId?: number,
  ) {
    const log = this.auditRepo.create({
      action,
      entity,
      entityId,
      details,
      user: userId ? { id: userId } : null,
      timestamp: new Date(),
    } as any);
    await this.auditRepo.save(log);
  }
}
