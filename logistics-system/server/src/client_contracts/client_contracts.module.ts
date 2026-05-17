import { Module } from '@nestjs/common';
import { ClientContractsService } from './client_contracts.service';
import { ClientContractsController } from './client_contracts.controller';

@Module({
  controllers: [ClientContractsController],
  providers: [ClientContractsService],
})
export class ClientContractsModule {}
