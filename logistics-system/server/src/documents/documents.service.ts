import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(@InjectRepository(Document) private repo: Repository<Document>) {}
  create(dto: any) {
    return this.repo.save(dto);
  }
  findAll() {
    return this.repo.find();
  }
  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }
  update(id: number, dto: any) {
    return this.repo.update(id, dto);
  }
  remove(id: number) {
    return this.repo.delete(id);
  }
}
