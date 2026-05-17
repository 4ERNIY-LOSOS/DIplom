import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit_log.entity';

@Injectable()
export class AuditLogsService {
  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}
  create(dto: any) {
    return this.repo.save(dto);
  }
  findAll() {
    return this.repo.find({
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }
  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }
  update(id: number, dto: any) {
    return this.repo.update(id, dto);
  }
  remove(id: number) {
    return this.repo.delete(id);
  }
}
