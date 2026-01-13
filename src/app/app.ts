import { Component, signal, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GasolineraService } from './services/gasolinera.service';
import { LocationService } from './services/location.service';
import {
  Gasolinera,
  ComunidadAutonoma,
  Provincia,
  Municipio,
  ProductoPetrolifero,
  FilterOptions
} from './models/gasolinera.interface';
import { UserLocation, RouteSearch } from './models/location.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private gasolineraService = inject(GasolineraService);
  private locationService = inject(LocationService);
  private fb = inject(FormBuilder);

  // Título de la aplicación
  title = signal('Gasolineras Cercanas - Versión Avanzada');

  // Señales para el estado de la aplicación
  gasolineras = signal<Gasolinera[]>([]);
  filteredGasolineras = signal<Gasolinera[]>([]);
  loading = signal(false);
  loadingLocation = signal(false);
  error = signal<string | null>(null);
  userLocation = signal<UserLocation | null>(null);

  // Datos para filtros avanzados
  availableBrands = signal<string[]>([]);
  availableFuelTypes = signal<string[]>(['gasolina95', 'gasolina98', 'gasoilA', 'gasoilB', 'glp', 'gnc']);
  comunidadesAutonomas = signal<ComunidadAutonoma[]>([]);
  provincias = signal<Provincia[]>([]);
  municipios = signal<Municipio[]>([]);
  productos = signal<ProductoPetrolifero[]>([]);

  // Estadísticas
  nearestGasolinera = signal<Gasolinera | null>(null);
  cheapestInRadius = signal<Gasolinera | null>(null);
  priceStats = signal<{ min: number, max: number, avg: number } | null>(null);

  // Control de modos
  advancedMode = signal(false);
  routeMode = signal(false);
  onlyOpenStations = signal(false);

  // Formularios
  searchForm: FormGroup;
  filterForm: FormGroup;
  routeForm: FormGroup;

  constructor() {
    // Formulario principal de búsqueda
    this.searchForm = this.fb.group({
      latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      radius: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      searchTerm: ['']
    });

    // Formulario de filtros avanzados
    this.filterForm = this.fb.group({
      brand: [''],
      fuelType: [''],
      minPrice: ['', [Validators.min(0), Validators.max(10)]],
      maxPrice: ['', [Validators.min(0), Validators.max(10)]],
      ccaaId: [''],
      provinciaId: [''],
      municipioId: [''],
      productoId: [''],
      empresasWhitelist: [''],
      empresasBlacklist: [''],
      sortBy: ['distance'],
      maxResults: [50, [Validators.min(1), Validators.max(500)]]
    });

    // Formulario de búsqueda en ruta
    this.routeForm = this.fb.group({
      startLat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      startLon: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      endLat: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
      endLon: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
      maxDetour: [5, [Validators.required, Validators.min(1), Validators.max(50)]]
    });

    // Configurar efectos reactivos
    this.setupEffects();
  }

  ngOnInit() {
    // Cargar datos iniciales
    this.loadInitialData();
  }

  private setupEffects() {
    // Efecto para aplicar filtros automáticamente
    effect(() => {
      if (this.gasolineras().length > 0) {
        this.applyFilters();
      }
    });

    // Escuchar cambios en formularios
    this.searchForm.valueChanges.subscribe(() => {
      if (this.gasolineras().length > 0) {
        this.applyFilters();
      }
    });

    this.filterForm.valueChanges.subscribe(() => {
      if (this.gasolineras().length > 0) {
        this.applyFilters();
      }
    });
  }

  // === MÉTODOS DE CARGA DE DATOS ===

  async loadInitialData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Cargar en paralelo todos los datos necesarios
      const [gasolineras, ccaas, provincias, productos] = await Promise.all([
        this.gasolineraService.getAllGasolineras(),
        this.gasolineraService.getComunidadesAutonomas(),
        this.gasolineraService.getProvincias(),
        this.gasolineraService.getProductosPetroliferos()
      ]);

      console.log(`Datos cargados: ${gasolineras.length} gasolineras, ${ccaas.length} CCAA, ${provincias.length} provincias`);

      this.gasolineras.set(gasolineras);
      this.comunidadesAutonomas.set(ccaas);
      this.provincias.set(provincias);
      this.productos.set(productos);

      this.extractFilters(gasolineras);
      this.filteredGasolineras.set(gasolineras);

      // Intentar obtener ubicación automáticamente
      this.tryGetAutoLocation();

    } catch (error: any) {
      this.error.set('Error al cargar datos iniciales: ' + error.message);
      console.error('Error en carga inicial:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadGasolinerasByFilter(options: FilterOptions) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.gasolineraService.getGasolinerasByFilter(options);
      console.log(`Datos filtrados cargados: ${data.length} gasolineras`);
      this.gasolineras.set(data);
      this.extractFilters(data);
      this.applyFilters();
    } catch (error: any) {
      this.error.set('Error al cargar gasolineras filtradas: ' + error.message);
    } finally {
      this.loading.set(false);
    }
  }

  // === MÉTODOS DE UBICACIÓN ===

  private async tryGetAutoLocation() {
    try {
      this.loadingLocation.set(true);
      const location = await this.locationService.getLocationWithFallback();
      this.setUserLocation(location);
      console.log(`Ubicación obtenida automáticamente (${location.source}):`, location);
    } catch (error) {
      console.warn('No se pudo obtener ubicación automática:', error);
      // No mostrar error al usuario, es opcional
    } finally {
      this.loadingLocation.set(false);
    }
  }

  async getCurrentLocationGPS() {
    try {
      this.loadingLocation.set(true);
      this.error.set(null);

      const location = await this.locationService.getCurrentLocation();
      this.setUserLocation(location);

    } catch (error: any) {
      this.error.set('Error al obtener ubicación GPS: ' + error.message);
      console.error('Error de geolocalización GPS:', error);
    } finally {
      this.loadingLocation.set(false);
    }
  }

  async getCurrentLocationIP() {
    try {
      this.loadingLocation.set(true);
      this.error.set(null);

      const location = await this.locationService.getLocationByIP();
      this.setUserLocation(location);

    } catch (error: any) {
      this.error.set('Error al obtener ubicación por IP: ' + error.message);
      console.error('Error de geolocalización IP:', error);
    } finally {
      this.loadingLocation.set(false);
    }
  }

  private setUserLocation(location: UserLocation) {
    this.userLocation.set(location);
    this.searchForm.patchValue({
      latitude: location.latitude,
      longitude: location.longitude
    });

    // Aplicar filtros con la nueva ubicación
    if (this.gasolineras().length > 0) {
      this.applyFilters();
    }
  }

  onManualLocationSubmit() {
    const formValue = this.searchForm.value;
    if (formValue.latitude && formValue.longitude) {
      const location = this.locationService.createManualLocation(
        parseFloat(formValue.latitude),
        parseFloat(formValue.longitude)
      );
      this.setUserLocation(location);
    }
  }

  // === MÉTODOS DE FILTROS Y PROCESAMIENTO ===

  private extractFilters(gasolineras: Gasolinera[]) {
    const brands = new Set<string>();

    gasolineras.forEach(g => {
      if (g['Rótulo'] && g['Rótulo'].trim()) brands.add(g['Rótulo']);
    });

    this.availableBrands.set(Array.from(brands).sort());
  }

  private applyFilters() {
    let filtered = [...this.gasolineras()];
    const searchValue = this.searchForm.value;
    const filterValue = this.filterForm.value;
    const userLoc = this.userLocation();

    // === FILTROS BÁSICOS ===

    // Filtrar por término de búsqueda
    if (searchValue.searchTerm) {
      const searchTerm = searchValue.searchTerm.toLowerCase();
      filtered = filtered.filter(g =>
        g['Rótulo']?.toLowerCase().includes(searchTerm) ||
        g['Dirección']?.toLowerCase().includes(searchTerm) ||
        g.Municipio?.toLowerCase().includes(searchTerm) ||
        g.Provincia?.toLowerCase().includes(searchTerm)
      );
    }

    // === FILTROS AVANZADOS ===

    // Filtrar por empresa (whitelist y blacklist)
    if (filterValue.empresasWhitelist) {
      const whitelist = filterValue.empresasWhitelist.split(',').map((s: string) => s.trim().toLowerCase());
      filtered = filtered.filter(g =>
        whitelist.some((empresa: string) => g['Rótulo'].toLowerCase().includes(empresa))
      );
    }

    if (filterValue.empresasBlacklist) {
      const blacklist = filterValue.empresasBlacklist.split(',').map((s: string) => s.trim().toLowerCase());
      filtered = filtered.filter(g =>
        !blacklist.some((empresa: string) => g['Rótulo'].toLowerCase().includes(empresa))
      );
    }

    // Filtrar por marca específica
    if (filterValue.brand) {
      filtered = this.gasolineraService.filterByBrand(filtered, filterValue.brand);
    }

    // Filtrar por tipo de combustible
    if (filterValue.fuelType) {
      filtered = this.gasolineraService.filterByFuelType(filtered, filterValue.fuelType);
    }

    // Filtrar solo gasolineras abiertas
    if (this.onlyOpenStations()) {
      filtered = this.gasolineraService.filterByOpenStatus(filtered, true);
    }

    // === CÁLCULOS DE DISTANCIA ===

    // Calcular distancia y filtrar por radio
    if (userLoc) {
      filtered = filtered.map(g => {
        if (!g.Latitud || !g['Longitud (WGS84)']) return { ...g, distance: Infinity };

        const distance = this.locationService.calculateDistance(
          userLoc.latitude,
          userLoc.longitude,
          parseFloat(g.Latitud.replace(',', '.')),
          parseFloat(g['Longitud (WGS84)'].replace(',', '.'))
        );
        return { ...g, distance };
      });

      // Filtrar por radio
      if (searchValue.radius) {
        filtered = filtered.filter(g => (g.distance || Infinity) <= searchValue.radius);
      }
    }

    // === FILTROS DE PRECIO ===

    if (filterValue.minPrice || filterValue.maxPrice) {
      filtered = filtered.filter(g => {
        const cheapest = g.cheapestFuel;
        if (!cheapest) return false;

        if (filterValue.minPrice && cheapest.price < parseFloat(filterValue.minPrice)) return false;
        if (filterValue.maxPrice && cheapest.price > parseFloat(filterValue.maxPrice)) return false;
        return true;
      });
    }

    // === ORDENAMIENTO ===

    const sortBy = filterValue.sortBy || 'distance';

    switch (sortBy) {
      case 'distance':
        if (userLoc) {
          filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }
        break;
      case 'price':
        filtered.sort((a, b) => {
          const priceA = a.cheapestFuel?.price || Infinity;
          const priceB = b.cheapestFuel?.price || Infinity;
          return priceA - priceB;
        });
        break;
      case 'name':
        filtered.sort((a, b) => (a['Rótulo'] || '').localeCompare(b['Rótulo'] || ''));
        break;
    }

    // === LÍMITE DE RESULTADOS ===

    if (filterValue.maxResults && filterValue.maxResults > 0) {
      filtered = filtered.slice(0, filterValue.maxResults);
    }

    // === ACTUALIZAR ESTADO ===

    this.filteredGasolineras.set(filtered);
    this.updateStats(filtered);
  }

  private updateStats(gasolineras: Gasolinera[]) {
    // Encontrar gasolinera más cercana
    const nearest = this.gasolineraService.findNearestGasolinera(gasolineras);
    this.nearestGasolinera.set(nearest);

    // Encontrar más barata en radio
    const radius = this.searchForm.value.radius || 50;
    const cheapest = this.gasolineraService.findCheapestInRadius(gasolineras, radius);
    this.cheapestInRadius.set(cheapest);

    // Calcular estadísticas de precio
    const fuelType = this.filterForm.value.fuelType || 'gasolina95';
    const stats = this.gasolineraService.getPriceStats(gasolineras, fuelType);
    this.priceStats.set(stats);
  }

  // === MÉTODOS DE BÚSQUEDA EN RUTA ===

  async searchInRoute() {
    if (!this.routeForm.valid) {
      this.error.set('Por favor, complete todos los campos de la ruta');
      return;
    }

    const routeValue = this.routeForm.value;
    const route: RouteSearch = {
      startPoint: {
        latitude: parseFloat(routeValue.startLat),
        longitude: parseFloat(routeValue.startLon),
        name: 'Origen'
      },
      endPoint: {
        latitude: parseFloat(routeValue.endLat),
        longitude: parseFloat(routeValue.endLon),
        name: 'Destino'
      },
      maxDetour: routeValue.maxDetour
    };

    try {
      this.loading.set(true);
      const gasolinerasInRoute = this.locationService.findGasolinerasInRoute(this.gasolineras(), route);
      this.filteredGasolineras.set(gasolinerasInRoute);
      console.log(`Encontradas ${gasolinerasInRoute.length} gasolineras en la ruta`);
    } catch (error: any) {
      this.error.set('Error al buscar en ruta: ' + error.message);
    } finally {
      this.loading.set(false);
    }
  }

  // === MÉTODOS DE CARGA DE DATOS ESPECÍFICOS ===

  async loadProvincesByRegion(ccaaId: string) {
    try {
      const provincias = await this.gasolineraService.getProvinciasByCCAA(ccaaId);
      this.provincias.set(provincias);
    } catch (error) {
      console.error('Error cargando provincias por CCAA:', error);
    }
  }

  async loadMunicipalitiesByProvince(provinciaId: string) {
    try {
      const municipios = await this.gasolineraService.getMunicipiosByProvincia(provinciaId);
      this.municipios.set(municipios);
    } catch (error) {
      console.error('Error cargando municipios por provincia:', error);
    }
  }

  // === MÉTODOS DE CONTROL DE UI ===

  toggleAdvancedMode() {
    this.advancedMode.set(!this.advancedMode());
  }

  toggleRouteMode() {
    this.routeMode.set(!this.routeMode());
    if (this.routeMode()) {
      this.advancedMode.set(false);
    }
  }

  toggleOnlyOpenStations() {
    this.onlyOpenStations.set(!this.onlyOpenStations());
    this.applyFilters();
  }

  resetFilters() {
    this.filterForm.reset();
    this.searchForm.patchValue({
      radius: 10,
      searchTerm: ''
    });
    this.applyFilters();
  }

  clearResults() {
    this.filteredGasolineras.set([]);
    this.nearestGasolinera.set(null);
    this.cheapestInRadius.set(null);
    this.priceStats.set(null);
  }

  // === MÉTODOS DE UTILIDAD ===

  getFormattedDistance(distance?: number): string {
    if (!distance || distance === Infinity) return 'N/A';
    return distance < 1
      ? `${Math.round(distance * 1000)} m`
      : `${distance.toFixed(1)} km`;
  }

  getFormattedPrice(price?: string): string {
    if (!price || price === '' || price === '0,000') return 'N/A';
    return `${price} €/L`;
  }

  getLocationString(): string {
    const loc = this.userLocation();
    if (!loc) return 'No establecida';

    const source = loc.source === 'gps' ? '📍' : loc.source === 'ip' ? '🌐' : '📝';
    const location = loc.city && loc.region
      ? `${loc.city}, ${loc.region}`
      : `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`;

    return `${source} ${location}`;
  }

  getOpenStatus(horario: string): { isOpen: boolean; text: string; color: string } {
    if (!horario) return { isOpen: false, text: 'Sin horario', color: 'gray' };

    if (horario.toLowerCase().includes('24')) {
      return { isOpen: true, text: 'Abierto 24h', color: 'green' };
    }

    // Implementación básica de verificación de horario
    const now = new Date();
    const currentHour = now.getHours();
    const isOpen = currentHour >= 6 && currentHour <= 22; // Horario aproximado

    return {
      isOpen,
      text: isOpen ? 'Abierto' : 'Cerrado',
      color: isOpen ? 'green' : 'red'
    };
  }

  getCheapestFuelInfo(gasolinera: Gasolinera): string {
    if (!gasolinera.cheapestFuel) return 'Sin precios';
    return `${gasolinera.cheapestFuel.type}: ${gasolinera.cheapestFuel.price.toFixed(3)} €/L`;
  }

  // === MÉTODOS DE TESTING ===

  loadTestLocations() {
    const locations = this.locationService.createTestLocations();
    console.log('Ubicaciones de prueba disponibles:', locations);

    // Cargar Madrid como ejemplo
    this.setUserLocation(locations[0]);
  }

  exportResults() {
    const results = this.filteredGasolineras().map(g => ({
      nombre: g['Rótulo'],
      direccion: g['Dirección'],
      municipio: g.Municipio,
      provincia: g.Provincia,
      precio_gasolina_95: g['Precio Gasolina 95 E5'],
      precio_gasoleo_a: g['Precio Gasoleo A'],
      distancia_km: g.distance?.toFixed(2),
      horario: g.Horario,
      combustible_mas_barato: this.getCheapestFuelInfo(g)
    }));

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gasolineras_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  getCurrentTime(): string {
    return new Date().toLocaleString('es-ES');
  }

  reloadData() {
    this.loadInitialData();
  }

  onCCAAChange(event: any) {
    const ccaaId = event.target?.value;
    if (ccaaId) {
      this.loadProvincesByRegion(ccaaId);
    }
  }

  onProvinciaChange(event: any) {
    const provinciaId = event.target?.value;
    if (provinciaId) {
      this.loadMunicipalitiesByProvince(provinciaId);
    }
  }
}
