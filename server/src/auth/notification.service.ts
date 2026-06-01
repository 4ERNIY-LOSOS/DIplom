import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../notifications/entities/notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification) private noteRepo: Repository<Notification>,
  ) {}

  async notify(_userId: number, message: string) {
    const note = this.noteRepo.create({
      message,
      // userId: { id: userId } as any, // Добавьте связь, если нужно
      createdAt: new Date(),
    });
    await this.noteRepo.save(note);
  }
}
