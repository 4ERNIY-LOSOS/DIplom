import { Test, TestingModule } from '@nestjs/testing';
import { AdditionalServicesService } from './additional_services.service';

describe('AdditionalServicesService', () => {
  let service: AdditionalServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdditionalServicesService],
    }).compile();

    service = module.get<AdditionalServicesService>(AdditionalServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
