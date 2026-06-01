import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { OrdersModule } from './orders/orders.module';
import { CargosModule } from './cargos/cargos.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { DriversModule } from './drivers/drivers.module';
import { RolesModule } from './roles/roles.module';
import { TariffsModule } from './tariffs/tariffs.module';
import { ClientContractsModule } from './client_contracts/client_contracts.module';
import { RoutesModule } from './routes/routes.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdditionalServicesModule } from './additional_services/additional_services.module';
import { AuditLogsModule } from './audit_logs/audit_logs.module';
import { DocumentsModule } from './documents/documents.module';
import { AuthModule } from './auth/auth.module';

import { User } from './users/entities/user.entity';
import { Company } from './companies/entities/company.entity';
import { Order } from './orders/entities/order.entity';
import { Cargo } from './cargos/entities/cargo.entity';
import { Shipment } from './shipments/entities/shipment.entity';
import { Vehicle } from './vehicles/entities/vehicle.entity';
import { Driver } from './drivers/entities/driver.entity';
import { Role } from './roles/entities/role.entity';
import { Tariff } from './tariffs/entities/tariff.entity';
import { ClientContract } from './client_contracts/entities/client_contract.entity';
import { Route } from './routes/entities/route.entity';
import { Warehouse } from './warehouses/entities/warehouse.entity';
import { Notification } from './notifications/entities/notification.entity';
import { AdditionalService } from './additional_services/entities/additional_service.entity';
import { AuditLog } from './audit_logs/entities/audit_log.entity';
import { Document } from './documents/entities/document.entity';

import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'password',
      database: 'logistics_db',
      entities: [
        User,
        Company,
        Order,
        Cargo,
        Shipment,
        Vehicle,
        Driver,
        Role,
        Tariff,
        ClientContract,
        Route,
        Warehouse,
        Notification,
        AdditionalService,
        AuditLog,
        Document,
      ],
      synchronize: true,
    }),
    UsersModule,
    CompaniesModule,
    OrdersModule,
    CargosModule,
    ShipmentsModule,
    VehiclesModule,
    DriversModule,
    RolesModule,
    TariffsModule,
    ClientContractsModule,
    RoutesModule,
    WarehousesModule,
    NotificationsModule,
    AdditionalServicesModule,
    AuditLogsModule,
    DocumentsModule,
    AuthModule,
    SeedModule,
  ],
  providers: [],
})
export class AppModule {}
