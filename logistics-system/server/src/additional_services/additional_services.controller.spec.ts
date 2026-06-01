import { Test, TestingModule } from '@nestjs/testing';
import { AdditionalServicesController } from './additional_services.controller';
import { AdditionalServicesService } from './additional_services.service';

describe('AdditionalServicesController', () => {
  let controller: AdditionalServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdditionalServicesController],
      providers: [AdditionalServicesService],
    }).compile();

    controller = module.get<AdditionalServicesController>(
      AdditionalServicesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
