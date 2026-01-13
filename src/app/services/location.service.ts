import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserLocation, LocationError, IPLocationResponse, RoutePoint, RouteSearch } from '../models/location.interface';
import { Gasolinera } from '../models/gasolinera.interface';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  async getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({
          code: 0,
          message: 'La geolocalización no está soportada por este navegador.'
        } as LocationError);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache por 1 minuto
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            source: 'gps'
          });
        },
        (error) => {
          let message: string;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Acceso a la ubicación denegado por el usuario.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'La información de ubicación no está disponible.';
              break;
            case error.TIMEOUT:
              message = 'Se agotó el tiempo de espera para obtener la ubicación.';
              break;
            default:
              message = 'Error desconocido al obtener la ubicación.';
              break;
          }

          reject({
            code: error.code,
            message: message
          } as LocationError);
        },
        options
      );
    });
  }

  // Calcular distancia usando la fórmula de Haversine
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en kilómetros
  }

  // Validar coordenadas
  isValidCoordinates(latitude: number, longitude: number): boolean {
    return (
      latitude >= -90 && latitude <= 90 &&
      longitude >= -180 && longitude <= 180
    );
  }

  // Obtener ubicación por IP (como fallback) - Versión mejorada
  async getLocationByIP(): Promise<UserLocation> {
    try {
      // Usar servicio gratuito de geolocalización por IP
      const response = await firstValueFrom(
        this.http.get<IPLocationResponse>('https://ipapi.co/json/')
      );

      if (response.lat && response.lon) {
        return {
          latitude: response.lat,
          longitude: response.lon,
          source: 'ip',
          city: response.city,
          region: response.region,
          country: response.country,
          address: `${response.city}, ${response.region}, ${response.country}`
        };
      }

      throw new Error('Respuesta inválida del servicio de IP');
    } catch (error) {
      console.error('Error obteniendo ubicación por IP:', error);
      throw new Error('No se pudo obtener la ubicación por IP');
    }
  }

  // === MÉTODOS DE GEOCODING ===

  // Geocoding reverso: obtener dirección desde coordenadas
  async getAddressFromCoordinates(lat: number, lon: number): Promise<{
    address: string;
    city: string;
    region: string;
    country: string;
  }> {
    try {
      // Usar OpenStreetMap Nominatim (servicio gratuito)
      const response = await firstValueFrom(
        this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
      );

      const address = response.display_name || `${lat}, ${lon}`;
      const city = response.address?.city || response.address?.town || response.address?.village || 'Desconocida';
      const region = response.address?.state || response.address?.region || 'Desconocida';
      const country = response.address?.country || 'España';

      return { address, city, region, country };
    } catch (error) {
      console.warn('Error en geocoding reverso:', error);
      return {
        address: `${lat}, ${lon}`,
        city: 'Desconocida',
        region: 'Desconocida',
        country: 'España'
      };
    }
  }

  // === MÉTODOS DE RUTAS ===



  // Calcular desvío necesario para ir a un punto desde una ruta
  private calculateDetourDistance(start: RoutePoint, end: RoutePoint, point: RoutePoint): number {
    // Distancia directa start -> end
    const directDistance = this.calculateDistance(start.latitude, start.longitude, end.latitude, end.longitude);

    // Distancia con desvío: start -> point -> end
    const detourDistance =
      this.calculateDistance(start.latitude, start.longitude, point.latitude, point.longitude) +
      this.calculateDistance(point.latitude, point.longitude, end.latitude, end.longitude);

    // El desvío es la diferencia
    return detourDistance - directDistance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // === MÉTODOS DE UTILIDAD ===

  // Convertir coordenadas decimales a formato DMS (Grados, Minutos, Segundos)
  toDMS(decimal: number, isLatitude: boolean): string {
    const absolute = Math.abs(decimal);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    const direction = isLatitude
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');

    return `${degrees}°${minutes}'${seconds}"${direction}`;
  }

  // Calcular punto medio entre dos ubicaciones
  getMiddlePoint(point1: UserLocation, point2: UserLocation): UserLocation {
    const lat = (point1.latitude + point2.latitude) / 2;
    const lon = (point1.longitude + point2.longitude) / 2;

    return {
      latitude: lat,
      longitude: lon,
      source: 'manual'
    };
  }

  // Validar si una ubicación está dentro de España (aproximado)
  isLocationInSpain(location: UserLocation): boolean {
    // Coordenadas aproximadas de España
    const spainBounds = {
      north: 43.9,
      south: 35.2,
      west: -9.5,
      east: 4.5
    };

    return location.latitude >= spainBounds.south &&
           location.latitude <= spainBounds.north &&
           location.longitude >= spainBounds.west &&
           location.longitude <= spainBounds.east;
  }

  // Crear ubicaciones para testing
  createTestLocations(): UserLocation[] {
    return [
      { latitude: 40.4168, longitude: -3.7038, source: 'manual', city: 'Madrid', country: 'España' },
      { latitude: 41.3851, longitude: 2.1734, source: 'manual', city: 'Barcelona', country: 'España' },
      { latitude: 39.4699, longitude: -0.3763, source: 'manual', city: 'Valencia', country: 'España' },
      { latitude: 37.3891, longitude: -5.9845, source: 'manual', city: 'Sevilla', country: 'España' }
    ];
  }

  // Método con fallback automático GPS -> IP -> Error
  async getLocationWithFallback(): Promise<UserLocation> {
    try {
      return await this.getCurrentLocation();
    } catch (gpsError) {
      try {
        return await this.getLocationByIP();
      } catch (ipError) {
        throw new Error('No se pudo obtener la ubicación automáticamente');
      }
    }
  }

  // Crear ubicación manual
  createManualLocation(latitude: number, longitude: number): UserLocation {
    return {
      latitude,
      longitude,
      source: 'manual'
    };
  }

  // Encontrar gasolineras en ruta
  findGasolinerasInRoute(gasolineras: Gasolinera[], route: RouteSearch): Gasolinera[] {
    const routeDistance = this.calculateDistance(
      route.startPoint.latitude,
      route.startPoint.longitude,
      route.endPoint.latitude,
      route.endPoint.longitude
    );

    return gasolineras.filter(g => {
      if (!g.Latitud || !g['Longitud (WGS84)']) return false;

      const gasLat = parseFloat(g.Latitud.replace(',', '.'));
      const gasLon = parseFloat(g['Longitud (WGS84)'].replace(',', '.'));

      // Distancia desde inicio a gasolinera
      const distanceFromStart = this.calculateDistance(
        route.startPoint.latitude,
        route.startPoint.longitude,
        gasLat,
        gasLon
      );

      // Distancia desde gasolinera a destino
      const distanceToEnd = this.calculateDistance(
        gasLat,
        gasLon,
        route.endPoint.latitude,
        route.endPoint.longitude
      );

      // Calcular detour: (inicio->gasolinera + gasolinera->destino) - ruta_directa
      const detour = (distanceFromStart + distanceToEnd) - routeDistance;

      return detour <= route.maxDetour;
    }).map(g => {
      // Agregar información de detour
      const gasLat = parseFloat(g.Latitud!.replace(',', '.'));
      const gasLon = parseFloat(g['Longitud (WGS84)']!.replace(',', '.'));

      const distanceFromStart = this.calculateDistance(
        route.startPoint.latitude,
        route.startPoint.longitude,
        gasLat,
        gasLon
      );

      const distanceToEnd = this.calculateDistance(
        gasLat,
        gasLon,
        route.endPoint.latitude,
        route.endPoint.longitude
      );

      const detour = (distanceFromStart + distanceToEnd) - routeDistance;

      return {
        ...g,
        distance: distanceFromStart,
        detour: detour
      };
    }).sort((a, b) => (a.detour || 0) - (b.detour || 0));
  }
}
