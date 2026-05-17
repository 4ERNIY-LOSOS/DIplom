import { Test, TestingModule } from '@nestjs/testing';
import { ClientContractsController } from './client_contracts.controller';
import { ClientContractsService } from './client_contracts.service';

describe('ClientContractsController', () => {
  let controller: ClientContractsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientContractsController],
      providers: [ClientContractsService],
    }).compile();

    controller = module.get<ClientContractsController>(
      ClientContractsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
