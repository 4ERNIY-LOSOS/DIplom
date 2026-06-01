import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CargosService } from './cargos.service';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cargos')
@UseGuards(JwtAuthGuard)
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Post()
  create(@Body() _createCargoDto: CreateCargoDto) {
    return this.cargosService.create();
  }

  @Get()
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() _updateCargoDto: UpdateCargoDto) {
    return this.cargosService.update(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargosService.remove(+id);
  }
}
