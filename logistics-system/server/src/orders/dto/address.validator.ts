import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import axios from 'axios';

@ValidatorConstraint({ name: 'isRealAddress', async: true })
export class IsRealAddressConstraint implements ValidatorConstraintInterface {
  async validate(address: string) {
    if (!address || address.length < 5) return false;
    try {
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: address,
            format: 'json',
            addressdetails: 1, // Запрашиваем детали адреса
            limit: 1,
          },
          headers: { 'User-Agent': 'LogisticsApp/1.0' },
        },
      );

      if (response.data.length === 0) return false;

      const addr = response.data[0].address;
      // Проверяем наличие критических компонентов: город/населенный пункт, улица, дом
      const hasCity = addr.city || addr.town || addr.village;
      const hasRoad = addr.road;
      const hasHouse = addr.house_number;

      return !!(hasCity && hasRoad && hasHouse);
    } catch {
      return false;
    }
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Укажите полный адрес: город, улицу и номер дома';
  }
}

export function IsRealAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRealAddressConstraint,
    });
  };
}
