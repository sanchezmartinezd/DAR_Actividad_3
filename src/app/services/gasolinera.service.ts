import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, forkJoin } from 'rxjs';
import {
  Gasolinera,
  ApiResponse,
  ComunidadAutonoma,
  Provincia,
  Municipio,
  ProductoPetrolifero,
  FilterOptions
} from '../models/gasolinera.interface';

@Injectable({
  providedIn: 'root'
})
export class GasolineraService {
  private readonly BASE_URL = 'https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';
  private readonly API_URL = `${this.BASE_URL}/EstacionesTerrestres/`;

  // Cache para listados estáticos
  private ccaaCache: ComunidadAutonoma[] | null = null;
  private provinciasCache: Provincia[] | null = null;
  private municipiosCache: Map<string, Municipio[]> = new Map();
  private productosCache: ProductoPetrolifero[] | null = null;

  constructor(private http: HttpClient) {}

  // === MÉTODOS PRINCIPALES DE GASOLINERAS ===

  async getAllGasolineras(): Promise<Gasolinera[]> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<Gasolinera>>(this.API_URL)
    );

    if (response && response.ListaEESSPrecio) {
      console.log('Datos cargados desde la API oficial:', response.ListaEESSPrecio.length, 'gasolineras');
      const processedData = this.processGasolineraData(response.ListaEESSPrecio);
      return processedData;
    }

    throw new Error('No se encontraron datos en la respuesta de la API');
  }

  async getGasolinerasByFilter(options: FilterOptions): Promise<Gasolinera[]> {
    let url = this.API_URL;

    // Construir URL según filtros
    if (options.ccaaId && options.productoId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroCCAAProducto/${options.ccaaId}/${options.productoId}`;
    } else if (options.ccaaId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroCCAA/${options.ccaaId}`;
    } else if (options.provinciaId && options.productoId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroProvinciaProducto/${options.provinciaId}/${options.productoId}`;
    } else if (options.provinciaId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroProvincia/${options.provinciaId}`;
    } else if (options.municipioId && options.productoId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroMunicipioProducto/${options.municipioId}/${options.productoId}`;
    } else if (options.municipioId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroMunicipio/${options.municipioId}`;
    } else if (options.productoId) {
      url = `${this.BASE_URL}/EstacionesTerrestres/FiltroProducto/${options.productoId}`;
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<Gasolinera>>(url)
    );

    if (response && response.ListaEESSPrecio) {
      return this.processGasolineraData(response.ListaEESSPrecio);
    }

    return [];
  }

  async getGasolinerasHistoricas(fecha: string, options?: FilterOptions): Promise<Gasolinera[]> {
    let url = `${this.BASE_URL}/EstacionesTerrestresHist/${fecha}`;

    if (options?.ccaaId && options?.productoId) {
      url = `${this.BASE_URL}/EstacionesTerrestresHist/FiltroCCAAProducto/${fecha}/${options.ccaaId}/${options.productoId}`;
    } else if (options?.ccaaId) {
      url = `${this.BASE_URL}/EstacionesTerrestresHist/FiltroCCAA/${fecha}/${options.ccaaId}`;
    }
    // ... más combinaciones según necesidad

    const response = await firstValueFrom(
      this.http.get<ApiResponse<Gasolinera>>(url)
    );

    if (response && response.ListaEESSPrecio) {
      return this.processGasolineraData(response.ListaEESSPrecio);
    }

    return [];
  }

  // === MÉTODOS DE LISTADOS ESTÁTICOS ===

  async getComunidadesAutonomas(): Promise<ComunidadAutonoma[]> {
    if (this.ccaaCache) {
      return this.ccaaCache;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ComunidadAutonoma[]>(`${this.BASE_URL}/Listados/ComunidadesAutonomas/`)
      );
      this.ccaaCache = response;
      return response;
    } catch (error) {
      console.error('Error al cargar comunidades autónomas:', error);
      return [];
    }
  }

  async getProvincias(): Promise<Provincia[]> {
    if (this.provinciasCache) {
      return this.provinciasCache;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<Provincia[]>(`${this.BASE_URL}/Listados/Provincias/`)
      );
      this.provinciasCache = response;
      return response;
    } catch (error) {
      console.error('Error al cargar provincias:', error);
      return [];
    }
  }

  async getProvinciasByCCAA(ccaaId: string): Promise<Provincia[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<Provincia[]>(`${this.BASE_URL}/Listados/ProvinciasPorComunidad/${ccaaId}`)
      );
      return response;
    } catch (error) {
      console.error('Error al cargar provincias por CCAA:', error);
      return [];
    }
  }

  async getMunicipios(): Promise<Municipio[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<Municipio[]>(`${this.BASE_URL}/Listados/Municipios/`)
      );
      return response;
    } catch (error) {
      console.error('Error al cargar municipios:', error);
      return [];
    }
  }

  async getMunicipiosByProvincia(provinciaId: string): Promise<Municipio[]> {
    if (this.municipiosCache.has(provinciaId)) {
      return this.municipiosCache.get(provinciaId)!;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<Municipio[]>(`${this.BASE_URL}/Listados/MunicipiosPorProvincia/${provinciaId}`)
      );
      this.municipiosCache.set(provinciaId, response);
      return response;
    } catch (error) {
      console.error('Error al cargar municipios por provincia:', error);
      return [];
    }
  }

  async getProductosPetroliferos(): Promise<ProductoPetrolifero[]> {
    if (this.productosCache) {
      return this.productosCache;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<ProductoPetrolifero[]>(`${this.BASE_URL}/Listados/ProductosPetroliferos/`)
      );
      this.productosCache = response;
      return response;
    } catch (error) {
      console.error('Error al cargar productos petrolíferos:', error);
      return [];
    }
  }

  // === MÉTODOS DE PROCESAMIENTO Y FILTRADO ===

  private processGasolineraData(gasolineras: Gasolinera[]): Gasolinera[] {
    return gasolineras.map(gasolinera => ({
      ...gasolinera,
      isOpen: this.isGasolineraOpen(gasolinera.Horario),
      cheapestFuel: this.getCheapestFuel(gasolinera)
    }));
  }

  private isGasolineraOpen(horario: string): boolean {
    if (!horario || horario.toLowerCase().includes('24')) {
      return true; // Abierto 24h
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0=Domingo, 1=Lunes, ...
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Parsear horario (formato: "L-D: 06:00-22:00" o similar)
    const horarioClean = horario.replace(/\s+/g, '').toUpperCase();

    // Verificar si está abierto hoy
    let isOpenToday = false;

    if (horarioClean.includes('L-D') || horarioClean.includes('LUNES-DOMINGO')) {
      isOpenToday = true; // Abierto todos los días
    } else if (currentDay >= 1 && currentDay <= 5 && horarioClean.includes('L-V')) {
      isOpenToday = true; // Lunes a Viernes
    } else if (currentDay === 6 && horarioClean.includes('S')) {
      isOpenToday = true; // Sábado
    } else if (currentDay === 0 && horarioClean.includes('D')) {
      isOpenToday = true; // Domingo
    }

    if (!isOpenToday) return false;

    // Extraer horas (formato: HH:MM-HH:MM)
    const timeMatch = horarioClean.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
    if (timeMatch) {
      const openTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
      const closeTime = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);

      return currentTime >= openTime && currentTime <= closeTime;
    }

    return true; // Si no se puede parsear, asumir abierto
  }

  private getCheapestFuel(gasolinera: Gasolinera): { type: string; price: number } | undefined {
    const precios: { type: string; price: number }[] = [];

    const fuelTypes = [
      { key: 'Precio Gasolina 95 E5', name: 'Gasolina 95' },
      { key: 'Precio Gasolina 98 E5', name: 'Gasolina 98' },
      { key: 'Precio Gasoleo A', name: 'Gasóleo A' },
      { key: 'Precio Gasoleo B', name: 'Gasóleo B' },
      { key: 'Precio GLP', name: 'GLP' },
      { key: 'Precio GNC', name: 'GNC' }
    ];

    fuelTypes.forEach(fuel => {
      const precio = gasolinera[fuel.key as keyof Gasolinera] as string;
      if (precio && precio !== '') {
        const priceNum = parseFloat(precio.replace(',', '.'));
        if (!isNaN(priceNum) && priceNum > 0) {
          precios.push({ type: fuel.name, price: priceNum });
        }
      }
    });

    if (precios.length === 0) return undefined;

    return precios.reduce((min, current) =>
      current.price < min.price ? current : min
    );
  }

  // Filtrar gasolineras por precio de combustible
  filterByFuelType(gasolineras: Gasolinera[], fuelType: string): Gasolinera[] {
    return gasolineras.filter(gasolinera => {
      switch (fuelType) {
        case 'gasolina95':
          return gasolinera['Precio Gasolina 95 E5'] &&
                 parseFloat(gasolinera['Precio Gasolina 95 E5'].replace(',', '.')) > 0;
        case 'gasolina98':
          return gasolinera['Precio Gasolina 98 E5'] &&
                 parseFloat(gasolinera['Precio Gasolina 98 E5'].replace(',', '.')) > 0;
        case 'gasoilA':
          return gasolinera['Precio Gasoleo A'] &&
                 parseFloat(gasolinera['Precio Gasoleo A'].replace(',', '.')) > 0;
        case 'gasoilB':
          return gasolinera['Precio Gasoleo B'] &&
                 parseFloat(gasolinera['Precio Gasoleo B'].replace(',', '.')) > 0;
        case 'glp':
          return gasolinera['Precio GLP'] &&
                 parseFloat(gasolinera['Precio GLP'].replace(',', '.')) > 0;
        case 'gnc':
          return gasolinera['Precio GNC'] &&
                 parseFloat(gasolinera['Precio GNC'].replace(',', '.')) > 0;
        default:
          return true;
      }
    });
  }

  // Filtrar por empresa (whitelist o blacklist)
  filterByCompany(gasolineras: Gasolinera[], options: FilterOptions): Gasolinera[] {
    let filtered = gasolineras;

    if (options.empresasWhitelist && options.empresasWhitelist.length > 0) {
      filtered = filtered.filter(g =>
        options.empresasWhitelist!.some(empresa =>
          g['Rótulo'].toLowerCase().includes(empresa.toLowerCase())
        )
      );
    }

    if (options.empresasBlacklist && options.empresasBlacklist.length > 0) {
      filtered = filtered.filter(g =>
        !options.empresasBlacklist!.some(empresa =>
          g['Rótulo'].toLowerCase().includes(empresa.toLowerCase())
        )
      );
    }

    return filtered;
  }

  // Filtrar solo gasolineras abiertas
  filterByOpenStatus(gasolineras: Gasolinera[], onlyOpen: boolean): Gasolinera[] {
    if (!onlyOpen) return gasolineras;
    return gasolineras.filter(g => g.isOpen);
  }

  // Filtrar gasolineras por marca/empresa (método original mantenido por compatibilidad)
  filterByBrand(gasolineras: Gasolinera[], brand: string): Gasolinera[] {
    if (!brand) return gasolineras;

    return gasolineras.filter(gasolinera =>
      gasolinera['Rótulo'].toLowerCase().includes(brand.toLowerCase())
    );
  }

  // Obtener todas las marcas únicas
  getUniqueBrands(gasolineras: Gasolinera[]): string[] {
    const brands = gasolineras
      .map(g => g['Rótulo'])
      .filter(rotulo => rotulo && rotulo.trim() !== '');

    return [...new Set(brands)].sort();
  }

  // === MÉTODOS DE ANÁLISIS ===

  findNearestGasolinera(gasolineras: Gasolinera[]): Gasolinera | null {
    if (gasolineras.length === 0) return null;

    return gasolineras.reduce((nearest, current) =>
      (current.distance || Infinity) < (nearest.distance || Infinity) ? current : nearest
    );
  }

  findCheapestInRadius(gasolineras: Gasolinera[], radius: number): Gasolinera | null {
    const inRadius = gasolineras.filter(g => (g.distance || Infinity) <= radius);
    if (inRadius.length === 0) return null;

    return inRadius.reduce((cheapest, current) => {
      const currentPrice = current.cheapestFuel?.price || Infinity;
      const cheapestPrice = cheapest.cheapestFuel?.price || Infinity;
      return currentPrice < cheapestPrice ? current : cheapest;
    });
  }

  // Obtener estadísticas de precios
  getPriceStats(gasolineras: Gasolinera[], fuelType: string): { min: number, max: number, avg: number } | null {
    const prices = gasolineras
      .map(g => this.getFuelPrice(g, fuelType))
      .filter(price => price !== null) as number[];

    if (prices.length === 0) return null;

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
    };
  }

  private getFuelPrice(gasolinera: Gasolinera, fuelType: string): number | null {
    const fuelMapping: { [key: string]: keyof Gasolinera } = {
      'gasolina95': 'Precio Gasolina 95 E5',
      'gasolina98': 'Precio Gasolina 98 E5',
      'gasoilA': 'Precio Gasoleo A',
      'gasoilB': 'Precio Gasoleo B',
      'glp': 'Precio GLP',
      'gnc': 'Precio GNC'
    };

    const priceKey = fuelMapping[fuelType];
    if (!priceKey) return null;

    const priceStr = gasolinera[priceKey] as string;
    if (!priceStr || priceStr === '') return null;

    const price = parseFloat(priceStr.replace(',', '.'));
    return isNaN(price) ? null : price;
  }
}
