import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  
  // Проверяем аргумент --fresh
  const isFresh = process.argv.includes('--fresh');
  
  if (isFresh) {
    console.log('Running FRESH seed (clearing database)...');
  } else {
    console.log('Running standard seed...');
  }

  await seedService.seed(isFresh);
  
  await app.close();
  console.log('Seed operation completed successfully.');
  process.exit(0);
}

bootstrap();
