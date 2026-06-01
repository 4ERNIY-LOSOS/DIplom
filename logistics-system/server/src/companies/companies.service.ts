import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company) private companiesRepository: Repository<Company>,
  ) {}

  async update(id: number, dto: any) {
    this.logger.log(
      `[CompaniesService] Attempting to update company ${id} with: ${JSON.stringify(dto)}`,
    );

    const company = await this.companiesRepository.findOneBy({ id });
    if (!company) {
      this.logger.error(`[CompaniesService] Company with ID ${id} not found`);
      throw new NotFoundException('Компания не найдена');
    }

    // Используем Object.assign и save для надежности
    Object.assign(company, {
      name: dto.name,
      taxId: dto.taxId,
    });

    const saved = await this.companiesRepository.save(company);
    this.logger.log(`[CompaniesService] Successfully updated company ${id}`);
    return saved;
  }

  async create(dto: any) {
    const company = this.companiesRepository.create(dto);
    return await this.companiesRepository.save(company);
  }

  findAll() {
    return this.companiesRepository.find();
  }

  findOne(id: number) {
    return this.companiesRepository.findOneBy({ id });
  }
}
