import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Company } from '../companies/entities/company.entity';
import { Order } from '../orders/entities/order.entity';
import { Tariff } from '../tariffs/entities/tariff.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Tariff) private tariffRepository: Repository<Tariff>,
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Driver) private driversRepository: Repository<Driver>,
    @InjectRepository(Shipment) private shipmentsRepository: Repository<Shipment>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed(clear: boolean = false) {
    if (clear) {
      this.logger.log('Clearing database before seeding...');
      await this.usersRepository.query('TRUNCATE TABLE "users", "companies", "orders", "shipments", "cargos", "tariffs", "vehicles", "drivers" RESTART IDENTITY CASCADE');
    }

    this.logger.log('Starting full data database seeding...');

    // 1. Roles
    const roleNames = ['admin', 'logistician', 'client'];
    const roles: Record<string, Role> = {};
    for (const name of roleNames) {
      let role = await this.rolesRepository.findOneBy({ name });
      if (!role) role = await this.rolesRepository.save({ name });
      roles[name] = role;
    }

    // 2. Main Logistics Company
    let mainCompany = await this.companiesRepository.findOneBy({ taxId: '7701234567' });
    if (!mainCompany) {
      mainCompany = await this.companiesRepository.save({
        name: 'ТрансЛогистик Групп',
        contactEmail: 'info@translog.ru',
        taxId: '7701234567',
        isActive: true,
      });
    }

    const passwordHash = await bcrypt.hash('password123', 10);

    // 3. Personnel (Admins and Logisticians)
    const personnel = [
      { 
        username: 'admin_volkov', 
        fullName: 'Александр Сергеевич Волков', 
        email: 'volkov@translog.ru', 
        phone: '79001112233', 
        role: 'admin' 
      },
      { 
        username: 'logist_morozov', 
        fullName: 'Дмитрий Николаевич Морозов', 
        email: 'morozov@translog.ru', 
        phone: '79002223344', 
        role: 'logistician' 
      },
      { 
        username: 'logist_petrov', 
        fullName: 'Игорь Владимирович Петров', 
        email: 'petrov@translog.ru', 
        phone: '79003334455', 
        role: 'logistician' 
      },
    ];

    for (const p of personnel) {
      const { role, ...userData } = p;
      let user = await this.usersRepository.findOneBy({ username: userData.username });
      if (!user) {
        await this.usersRepository.save({
          ...userData,
          passwordHash,
          role: roles[role],
          company: mainCompany,
        });
      }
    }

    // 4. Vehicles and Drivers
    const vehiclesData = [
      { model: 'Scania R500', plateNumber: 'E555EE77', capacity: 25000, volumeCapacity: 90 },
      { model: 'Volvo FH16', plateNumber: 'A001AA77', capacity: 20000, volumeCapacity: 80 },
      { model: 'KAMAZ 5490', plateNumber: 'B002BB77', capacity: 15000, volumeCapacity: 60 },
      { model: 'Mercedes Actros', plateNumber: 'C003CC77', capacity: 18000, volumeCapacity: 70 },
      { model: 'GAZelle NEXT', plateNumber: 'X123XX77', capacity: 1500, volumeCapacity: 12 },
      { model: 'Renault T-Series', plateNumber: 'R888RR77', capacity: 22000, volumeCapacity: 85 },
      { model: 'DAF XF', plateNumber: 'D777DD77', capacity: 24000, volumeCapacity: 88 },
    ];
    const allVehicles: Vehicle[] = [];
    for (const v of vehiclesData) {
      let vehicle = await this.vehiclesRepository.findOneBy({ plateNumber: v.plateNumber });
      if (!vehicle) vehicle = await this.vehiclesRepository.save({ ...v, status: 'available' });
      allVehicles.push(vehicle);
    }

    const driversData = [
      { fullName: 'Сидоров Степан Игоревич', licenseNumber: '7710 998877', phone: '79201112233', licenseCategory: 'B, C' },
      { fullName: 'Николаев Андрей Сергеевич', licenseNumber: '7711 554433', phone: '79204445566', licenseCategory: 'C' },
      { fullName: 'Иванов Иван Иванович', licenseNumber: '7701 123456', phone: '79207778899', licenseCategory: 'B, C, E' },
      { fullName: 'Петров Петр Петрович', licenseNumber: '7702 654321', phone: '79200001122', licenseCategory: 'C' },
      { fullName: 'Волков Игорь Антонович', licenseNumber: '7703 112233', phone: '79203334455', licenseCategory: 'B' },
      { fullName: 'Зайцев Олег Павлович', licenseNumber: '7704 445566', phone: '79205556677', licenseCategory: 'C, E' },
      { fullName: 'Морозов Артем Викторович', licenseNumber: '7705 778899', phone: '79201114455', licenseCategory: 'B, C' },
    ];
    const allDrivers: Driver[] = [];
    for (const d of driversData) {
      let driver = await this.driversRepository.findOneBy({ licenseNumber: d.licenseNumber });
      if (!driver) driver = await this.driversRepository.save({ ...d, status: 'available' });
      else {
        // Update existing driver
        await this.driversRepository.update(driver.id, { licenseCategory: d.licenseCategory });
        driver.licenseCategory = d.licenseCategory;
      }
      allDrivers.push(driver);
    }

    // 5. Clients and Companies
    const clientsData = [
      { 
        username: 'client_ivanov', 
        fullName: 'Сергей Петрович Иванов', 
        email: 'ivanov@stroytech.ru', 
        phone: '79110001122',
        company: { name: 'ООО СтройТех', taxId: '5001002003', contactEmail: 'info@stroytech.ru' }
      },
      { 
        username: 'client_popov', 
        fullName: 'Владимир Андреевич Попов', 
        email: 'v.popov@metallurg.ru', 
        phone: '79119998877',
        company: { name: 'АО Металлург', taxId: '6602998877', contactEmail: 'office@metallurg.ru' }
      },
      { 
        username: 'client_kozlov', 
        fullName: 'Алексей Викторович Козлов', 
        email: 'kozlov@logistic.ru', 
        phone: '79115554433',
        company: { name: 'ООО Логистик Плюс', taxId: '7805112233', contactEmail: 'sales@logistic.ru' }
      },
    ];

    const categories = ['Обычный', 'Хрупкий', 'Опасный', 'Скоропортящийся', 'Рефрижераторный', 'Крупногабаритный'];
    const statuses = ['В ожидании', 'Запланировано', 'Подтверждено', 'В пути', 'Доставлено'];
    const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];

    const busyVehicleIds = new Set<number>();
    const busyDriverIds = new Set<number>();

    for (const cData of clientsData) {
      const { company: compData, ...userData } = cData;
      
      let company = await this.companiesRepository.findOneBy({ taxId: compData.taxId });
      if (!company) company = await this.companiesRepository.save({ ...compData, isActive: true });

      let user = await this.usersRepository.findOneBy({ username: userData.username });
      if (!user) user = await this.usersRepository.save({ ...userData, passwordHash, role: roles['client'], company });

      // 6. Orders
      const existingOrders = await this.ordersRepository.find({ where: { company: { id: company.id } } });
      if (existingOrders.length < 5) {
        for (let i = 0; i < 5; i++) {
          const status = statuses[i % statuses.length];
          const now = new Date();
          
          const pickupDate = (status !== 'В ожидании') ? new Date(now.getTime() - 86400000 * 3) : null;
          const deliveryStartDate = (status === 'В пути' || status === 'Доставлено') ? new Date(now.getTime() - 86400000 * 2) : null;
          const deliveryEndDate = (status === 'Доставлено') ? new Date(now.getTime() - 86400000 * 1) : null;

          // Determine if we can create a shipment
          let canCreateShipment = false;
          let vehicle: Vehicle | undefined;
          let driver: Driver | undefined;

          if (status !== 'В ожидании') {
            if (status === 'Доставлено') {
              vehicle = allVehicles[i % allVehicles.length];
              driver = allDrivers[i % allDrivers.length];
              canCreateShipment = true;
            } else {
              vehicle = allVehicles.find(v => !busyVehicleIds.has(v.id));
              driver = allDrivers.find(d => !busyDriverIds.has(d.id));
              if (vehicle && driver) {
                busyVehicleIds.add(vehicle.id);
                busyDriverIds.add(driver.id);
                canCreateShipment = true;
              }
            }
          }

          // ONLY set active status if we have resources
          const finalStatus = canCreateShipment ? status : 'В ожидании';

          const order = await this.ordersRepository.save({
            cargoName: `${user.fullName} (${company.name})`,
            weight: Number((Math.random() * 5000 + 100).toFixed(2)),
            volume: Number((Math.random() * 20 + 1).toFixed(2)),
            category: categories[i % categories.length],
            originAddress: cities[i % cities.length],
            destinationAddress: cities[(i + 1) % cities.length],
            status: finalStatus,
            distance: 500 + i * 100,
            estimatedPrice: 15000 + i * 5000,
            company,
            pickupDate: finalStatus !== 'В ожидании' ? pickupDate : null,
            deliveryStartDate: (finalStatus === 'В пути' || finalStatus === 'Доставлено') ? deliveryStartDate : null,
            deliveryEndDate: finalStatus === 'Доставлено' ? deliveryEndDate : null,
          });

          if (canCreateShipment && vehicle && driver) {
            if (status !== 'Доставлено') {
              await this.vehiclesRepository.update(vehicle.id, { status: 'В рейсе' });
              await this.driversRepository.update(driver.id, { status: 'В рейсе' });
            }

            await this.shipmentsRepository.save({
              status: status === 'Доставлено' ? 'Доставлено' : (status === 'В пути' ? 'В пути' : 'Запланировано'),
              vehicle,
              driver,
              orders: [order]
            });
          }
        }
      }
    }

    // 8. Tariffs
    if ((await this.tariffRepository.count()) === 0) {
      await this.tariffRepository.save([
        { name: 'Стандартный', basePrice: 1000, pricePerKm: 15, pricePerKg: 2, isActive: true },
        { name: 'Экспресс', basePrice: 2500, pricePerKm: 25, pricePerKg: 4, isActive: true },
      ]);
    }

    this.logger.log('Full data seeding completed.');
  }
}
