import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Включаем глобальную валидацию с русскими сообщениями
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = validationErrors.map((error) => {
          const field = error.property;
          // Карта соответствия полей для красивого вывода
          const fieldsMap: { [key: string]: string } = {
            cargoName: 'Название груза',
            weight: 'Вес',
            volume: 'Объем',
            category: 'Категория',
            originAddress: 'Адрес отправления',
            destinationAddress: 'Адрес назначения',
            pickupDate: 'Дата забора',
            username: 'Логин',
            passwordHash: 'Пароль',
            fullName: 'ФИО',
            email: 'Email',
            phone: 'Телефон',
            roleId: 'Роль',
            newPassword: 'Новый пароль',
          };
          const fieldName = fieldsMap[field] || field;
          return `${fieldName} заполнено неверно или отсутствует`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
