import { Test, TestingModule } from '@nestjs/testing';
import { ClientContractsService } from './client_contracts.service';

describe('ClientContractsService', () => {
  let service: ClientContractsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientContractsService],
    }).compile();

    service = module.get<ClientContractsService>(ClientContractsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
