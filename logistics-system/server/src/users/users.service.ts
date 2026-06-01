import {
  Injectable,
  OnModuleInit,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Company } from '../companies/entities/company.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
    @InjectRepository(Vehicle) private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Driver) private driversRepository: Repository<Driver>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const roles = ['admin', 'logistician', 'client'];
    for (const r of roles) {
      if (!(await this.rolesRepository.findOneBy({ name: r }))) {
        await this.rolesRepository.save({ name: r });
      }
    }

    // Создаем дефолтные машины
    const vehicleCount = await this.vehiclesRepository.count();
    if (vehicleCount === 0) {
      await this.vehiclesRepository.save([
        { model: 'Volvo FH16', plateNumber: 'A001AA77', capacity: 20000, volumeCapacity: 80 },
        { model: 'KAMAZ 5490', plateNumber: 'B002BB77', capacity: 15000, volumeCapacity: 60 },
        { model: 'Mercedes Actros', plateNumber: 'C003CC77', capacity: 18000, volumeCapacity: 70 },
      ] as Vehicle[]);
      this.logger.log('Дефолтные машины созданы с корректными характеристиками');
    }

    // Создаем дефолтных водителей
    const driverCount = await this.driversRepository.count();
    if (driverCount === 0) {
      await this.driversRepository.save([
        { fullName: 'Иванов Иван Иванович', licenseNumber: '7701 123456' },
        { fullName: 'Петров Петр Петрович', licenseNumber: '7702 654321' },
      ] as Driver[]);
      this.logger.log('Дефолтные водители созданы');
    }

    const passwordHash = await bcrypt.hash('admin', 10);
    for (const roleName of roles) {
      const role = await this.rolesRepository.findOneBy({ name: roleName });
      const userExists = await this.usersRepository.findOne({
        where: { username: roleName },
        relations: ['company'],
      });

      if (!userExists && role) {
        let company: Company | null = null;
        if (roleName === 'client') {
          company = await this.companiesRepository.findOneBy({
            name: 'Default Client Company',
          });
          if (!company) {
            company = await this.companiesRepository.save({
              name: 'Default Client Company',
              contactEmail: 'client@example.com',
              taxId: '0000000000',
            } as any);
          }
        }

        const user = this.usersRepository.create({
          username: roleName,
          passwordHash: passwordHash,
          role: role,
          company: company,
        });
        await this.usersRepository.save(user);
        this.logger.log(
          `Пользователь ${roleName} создан с компанией: ${company?.name || 'нет'}`,
        );
      }
    }
  }

  async updateWithSecurity(id: number, updateDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) throw new ConflictException('Пользователь не найден');

    if (updateDto.newPassword) {
      if (!updateDto.oldPassword)
        throw new ConflictException('Старый пароль обязателен');
      const isMatch = await bcrypt.compare(
        updateDto.oldPassword,
        user.passwordHash,
      );
      if (!isMatch) throw new ConflictException('Неверный старый пароль');
      user.passwordHash = await bcrypt.hash(updateDto.newPassword, 10);
    }

    if (updateDto.companyName || updateDto.taxId) {
      if (!user.company) {
        user.company = await this.companiesRepository.save({
          name: updateDto.companyName || 'New Company',
          contactEmail: user.email || 'N/A',
          taxId: updateDto.taxId || 'N/A',
        });
      } else {
        await this.companiesRepository.update(user.company.id, {
          name: updateDto.companyName || user.company.name,
          taxId: updateDto.taxId || user.company.taxId,
        });
      }
    }

    if (updateDto.roleId) {
      const newRole = await this.rolesRepository.findOneBy({ id: +updateDto.roleId });
      if (newRole && user.role?.name === 'admin' && newRole.name !== 'admin') {
        // Проверяем, не последний ли это админ
        const adminRole = await this.rolesRepository.findOneBy({ name: 'admin' });
        const adminCount = await this.usersRepository.count({ where: { role: { id: adminRole?.id } } });
        if (adminCount <= 1) {
          throw new ConflictException('Нельзя изменить роль последнего администратора');
        }
      }
      if (newRole) {
        user.role = newRole;
      }
    }

    Object.assign(user, {
      fullName: updateDto.fullName ?? user.fullName,
      email: updateDto.email ?? user.email,
      phone: updateDto.phone ?? user.phone,
      username: updateDto.username ?? user.username,
    });

    return await this.usersRepository.save(user);
  }

  async registerClient(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOneBy({
      username: createUserDto.username,
    });
    if (existingUser)
      throw new ConflictException(
        'Пользователь с таким логином уже существует',
      );

    return await this.dataSource.transaction(async (manager) => {
      let savedCompany = await manager.findOneBy(Company, {
        name: createUserDto.companyName,
      });

      if (!savedCompany) {
        const company = manager.create(Company, {
          name: createUserDto.companyName,
          contactEmail: createUserDto.email,
          taxId: createUserDto.taxId || 'N/A',
        });
        savedCompany = await manager.save(company);
      }

      let role;
      if (createUserDto.roleId) {
        role = await manager.findOneBy(Role, { id: +createUserDto.roleId });
      }
      if (!role) {
        role = await manager.findOneBy(Role, { name: 'client' });
      }

      const passwordHash = await bcrypt.hash(createUserDto.passwordHash, 10);

      const user = manager.create(User, {
        username: createUserDto.username,
        passwordHash: passwordHash,
        fullName: createUserDto.fullName,
        email: createUserDto.email,
        phone: createUserDto.phone,
        role: role ?? undefined,
        company: savedCompany, // Привязываем сохраненную компанию
      });

      const savedUser = await manager.save(user);
      this.logger.log(
        `Зарегистрирован клиент ${savedUser.username} с компанией ${savedCompany.name}`,
      );
      return savedUser;
    });
  }

  create(dto: CreateUserDto) {
    return this.usersRepository.save(dto as any);
  }
  findAll() {
    return this.usersRepository.find({ relations: ['role', 'company'] });
  }
  findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'company'],
    });
  }

  findOneByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['role', 'company'],
    });
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto & { passwordHash?: string; company?: any },
  ) {
    // Явно выбираем только те поля, которые должны попасть в базу
    const updateData: any = {};
    if (updateUserDto.fullName) updateData.fullName = updateUserDto.fullName;
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.phone) updateData.phone = updateUserDto.phone;
    if (updateUserDto.username) updateData.username = updateUserDto.username;
    if (updateUserDto.passwordHash)
      updateData.passwordHash = updateUserDto.passwordHash;
    if (updateUserDto.company) updateData.company = updateUserDto.company;

    // Используем save вместо update, если нужно обновлять связи (company)
    if (updateData.company) {
      const user = await this.findOne(id);
      if (user) {
        Object.assign(user, updateData);
        return await this.usersRepository.save(user);
      }
    }

    return await this.usersRepository.update(id, updateData);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }
}
