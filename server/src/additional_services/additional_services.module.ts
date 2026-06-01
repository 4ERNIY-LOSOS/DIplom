import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServicesService } from './additional_services.service';
import { AdditionalServicesController } from './additional_services.controller';
import { AdditionalService } from './entities/additional_service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalService])],
  controllers: [AdditionalServicesController],
  providers: [AdditionalServicesService],
  exports: [AdditionalServicesService],
})
export class AdditionalServicesModule {}
