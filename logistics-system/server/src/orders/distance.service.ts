import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DistanceService {
  private readonly geocodeUrl = 'https://nominatim.openstreetmap.org/search';

  async getDistance(origin: string, destination: string): Promise<number> {
    try {
      const originCoords = await this.getCoordinates(origin);
      const destCoords = await this.getCoordinates(destination);

      if (!originCoords || !destCoords) return 0;

      const dist = this.haversineDistance(originCoords, destCoords);
      // Коэффициент 1.3 для примерного перевода из прямой линии в дорожное расстояние
      return Math.round(dist * 1.3 * 10) / 10;
    } catch (e) {
      console.error('Distance calculation error:', e);
      return 0;
    }
  }

  private async getCoordinates(address: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await axios.get(this.geocodeUrl, {
        params: { q: address, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'LogisticsApp/1.0' }
      });

      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lon: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private haversineDistance(c1: { lat: number; lon: number }, c2: { lat: number; lon: number }): number {
    const R = 6371; // Радиус Земли в км
    const dLat = (c2.lat - c1.lat) * Math.PI / 180;
    const dLon = (c2.lon - c1.lon) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
