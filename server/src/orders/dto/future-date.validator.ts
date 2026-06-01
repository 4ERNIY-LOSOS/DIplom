import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(dateValue: any) {
    if (!dateValue) return false;

    const inputDate = new Date(dateValue);
    const today = new Date();

    // Устанавливаем время на 00:00:00 для обеих дат,
    // чтобы сравнивать именно календарные дни
    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Разрешаем только сегодняшний день или будущие даты
    return inputDate.getTime() >= today.getTime();
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Дата забора не может быть в прошлом';
  }
}

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFutureDateConstraint,
    });
  };
}
