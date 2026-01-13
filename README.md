# 🛣️ Buscador de Gasolineras - Aplicación Angular 21

Una aplicación web moderna desarrollada en Angular 21 que permite encontrar gasolineras cercanas utilizando la API oficial del Ministerio de Industria, Comercio y Turismo del Gobierno de España. Con filtros avanzados, geolocalización GPS y cálculos precisos de distancia.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Arquitectura de la Aplicación](#-arquitectura-de-la-aplicación)
- [Descripción Detallada de Archivos](#-descripción-detallada-de-archivos)
- [API del Gobierno](#-api-del-gobierno)
- [Funcionalidades Avanzadas](#-funcionalidades-avanzadas)
- [Scripts y Comandos](#-scripts-y-comandos)

## 🚀 Características

- **Geolocalización GPS**: Obtiene ubicación automática del dispositivo
- **Filtros Inteligentes**: Por marca, tipo de combustible, rango de precios y distancia
- **Cálculo Preciso de Distancia**: Algoritmo Haversine para distancias geográficas
- **Datos en Tiempo Real**: API oficial del gobierno español actualizada
- **Búsqueda Textual**: Por marca, dirección o municipio
- **Interfaz Moderna**: CSS Grid/Flexbox con animaciones y diseño responsivo
- **Múltiples Ordenamientos**: Por distancia, precio o nombre
- **Estados de Carga**: UX optimizada con indicadores visuales
- **Manejo Robusto de Errores**: Sistema completo de error handling

## 🛠️ Tecnologías Utilizadas

- **Angular 21**: Framework con componentes standalone y Signals
- **TypeScript 5.9**: Tipado fuerte y moderno
- **Angular Signals**: Gestión de estado reactivo
- **Reactive Forms**: Formularios avanzados con validación
- **RxJS**: Programación reactiva
- **CSS3**: Variables CSS, Grid, Flexbox y animaciones
- **Geolocation API**: Ubicación del navegador
- **HttpClient**: Consumo de APIs REST

## 📁 Estructura del Proyecto

```
apiGobOil/
├── 📁 .angular/                 # Cache y archivos temporales
├── 📁 .vscode/                  # Configuración VS Code
├── 📁 dist/                     # Build de producción
├── 📁 node_modules/             # Dependencias
├── 📁 public/                   # Archivos estáticos
├── 📁 src/                      # Código fuente
│   ├── 📄 index.html           # HTML base
│   ├── 📄 main.ts              # Bootstrap aplicación
│   ├── 📄 styles.css           # Estilos globales
│   └── 📁 app/                 # Aplicación principal
│       ├── 📄 app.config.ts    # Configuración global
│       ├── 📄 app.routes.ts    # Definición de rutas
│       ├── 📄 app.spec.ts      # Tests unitarios
│       ├── 📄 app.ts           # Componente principal
│       ├── 📄 app.html         # Template principal
│       ├── 📄 app.css          # Estilos componente
│       ├── 📁 models/          # Interfaces TypeScript
│       │   ├── 📄 gasolinera.interface.ts
│       │   └── 📄 location.interface.ts
│       └── 📁 services/        # Servicios Angular
│           ├── 📄 gasolinera.service.ts
│           └── 📄 location.service.ts
├── 📄 angular.json             # Configuración Angular
├── 📄 package.json             # Dependencias npm
├── 📄 tsconfig.json            # Config TypeScript global
├── 📄 tsconfig.app.json        # Config TypeScript app
├── 📄 tsconfig.spec.json       # Config TypeScript tests
└── 📄 README.md                # Esta documentación
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** versión 18 o superior
- **npm** (incluido con Node.js)
- **Angular CLI** (se instalará automáticamente)

### Instalación Paso a Paso

1. **Clonar y acceder al directorio**:
   ```bash
   git clone [url-del-repositorio]
   cd apiGobOil
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm start
   # La aplicación se abrirá en http://localhost:4200
   ```

4. **Build para producción**:
   ```bash
   npm run build
   ```

## 🏗️ Arquitectura de la Aplicación

### Patrón Arquitectónico
La aplicación sigue una arquitectura de **componente único con servicios especializados**:

- **Componente Principal** (`app.ts`): Centraliza lógica de UI y estado
- **Servicios Especializados**: Encapsulan lógica de negocio específica
- **Modelos TypeScript**: Definen contratos de datos
- **Reactive Forms**: Validación y gestión de formularios

### Flujo de Datos
1. **Inicialización**: Carga datos de la API gubernamental
2. **Ubicación**: Obtiene GPS o coordenadas manuales
3. **Filtrado**: Aplica filtros reactivos en tiempo real
4. **Cálculos**: Computa distancias y ordena resultados
5. **Renderizado**: Muestra gasolineras filtradas

### Gestión de Estado con Signals
```typescript
// Estado reactivo moderno
gasolineras = signal<Gasolinera[]>([]);
filteredGasolineras = signal<Gasolinera[]>([]);
loading = signal(false);
userLocation = signal<UserLocation | null>(null);
```

## 📄 Descripción Detallada de Archivos

### Archivos de Configuración

#### `package.json` - Gestión de Dependencias
**Propósito**: Define dependencias, scripts y configuración del proyecto.

**Dependencias Clave**:
- `@angular/core: ^21.0.0` - Framework Angular
- `@angular/common: ^21.0.0` - Módulos comunes
- `@angular/forms: ^21.0.0` - Formularios reactivos
- `rxjs: ~7.8.0` - Programación reactiva
- `typescript: ~5.9.0` - Lenguaje de desarrollo

**Scripts Principales**:
```json
{
  "start": "ng serve --port 4201",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

#### `angular.json` - Configuración del Workspace
**Propósito**: Configuraciones de build, serve, test y deploy.

**Configuraciones Importantes**:
- **Build**: Optimizaciones para producción
- **Serve**: Servidor de desarrollo con hot reload
- **Test**: Configuración de Karma y Jasmine
- **Extracti18n**: Internacionalización

#### `tsconfig.json` - Configuración TypeScript
**Propósito**: Compilación y reglas de TypeScript.

**Configuraciones Clave**:
```json
{
  "strict": true,
  "target": "ES2022",
  "module": "ES2022",
  "experimentalDecorators": true,
  "emitDecoratorMetadata": true
}
```

### Código Fuente Principal

#### `src/main.ts` - Bootstrap de la Aplicación
**Propósito**: Punto de entrada y configuración inicial.

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
```

**Responsabilidades**:
- Inicializar aplicación Angular
- Cargar configuración global
- Manejo de errores de bootstrap

#### `src/index.html` - Estructura HTML Base
**Propósito**: Página HTML principal y metadatos.

**Elementos Importantes**:
- Meta viewport para diseño responsivo
- Íconos y manifest para PWA
- Contenedor `<app-root>` para Angular
- Fuentes web y recursos estáticos

#### `src/styles.css` - Estilos Globales
**Propósito**: Definiciones CSS globales y variables.

**Características**:
- Variables CSS para colores y spacing
- Reset de estilos del navegador
- Fuentes web (Google Fonts)
- Clases utilitarias globales

### Componente Principal

#### `src/app/app.ts` - Lógica Principal
**Propósito**: Componente raíz con toda la lógica de la aplicación.

**Señales (Signals) Principales**:
```typescript
gasolineras = signal<Gasolinera[]>([]);           // Datos originales
filteredGasolineras = signal<Gasolinera[]>([]);   // Datos filtrados
loading = signal(false);                          // Estado de carga
error = signal<string>('');                       // Mensajes de error
userLocation = signal<UserLocation | null>(null); // Ubicación usuario
availableBrands = signal<string[]>([]);           // Marcas disponibles
availableFuelTypes = signal<string[]>([]);        // Tipos combustible
```

**Formulario Reactivo**:
```typescript
searchForm = this.fb.group({
  latitude: ['', [Validators.required, Validators.min(-90), Validators.max(90)]],
  longitude: ['', [Validators.required, Validators.min(-180), Validators.max(180)]],
  radius: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
  textSearch: [''],
  brand: [''],
  fuelType: [''],
  sortBy: ['distance'],
  minPrice: [null, [Validators.min(0), Validators.max(10)]],
  maxPrice: [null, [Validators.min(0), Validators.max(10)]]
});
```

**Métodos Clave**:

1. **`loadGasolineras()`**: Carga datos de la API
2. **`getCurrentLocation()`**: Obtiene ubicación GPS
3. **`applyFilters()`**: Sistema de filtrado múltiple
4. **`calculateDistance()`**: Algoritmo Haversine
5. **`sortGasolineras()`**: Ordenamiento múltiple

#### `src/app/app.html` - Template Principal
**Propósito**: Estructura HTML con binding de datos y control flow.

**Secciones Principales**:

1. **Header con Título y Descripción**
2. **Formulario de Búsqueda**:
   ```html
   <form [formGroup]="searchForm" (ngSubmit)="getCurrentLocation()">
     <!-- Coordenadas GPS y botón ubicación -->
   </form>
   ```

3. **Panel de Filtros**:
   ```html
   <div class="filters-section">
     <!-- Filtros por texto, marca, combustible, precio -->
   </div>
   ```

4. **Grid de Resultados**:
   ```html
   @for (gasolinera of filteredGasolineras(); track gasolinera.IDEESS) {
     <div class="gasolinera-card">
       <!-- Información de cada gasolinera -->
     </div>
   }
   ```

**Características Modernas**:
- Control flow con `@if`, `@for`, `@switch`
- Binding bidireccional con `[(ngModel)]`
- Event binding con `(click)`, `(submit)`
- Property binding con `[class]`, `[disabled]`

#### `src/app/app.css` - Estilos del Componente
**Propósito**: Estilos específicos del componente principal.

**Variables CSS**:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #7c3aed;
  --success-color: #059669;
  --danger-color: #dc2626;
  --warning-color: #d97706;
  --text-color: #1f2937;
  --bg-color: #f9fafb;
  --border-color: #e5e7eb;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --border-radius: 0.5rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}
```

**Componentes de Estilo**:
- **Layout Principal**: CSS Grid responsivo
- **Tarjetas**: Cards con shadow y hover effects
- **Formularios**: Inputs estilizados con validación visual
- **Estados**: Loading, error, success indicators
- **Animaciones**: Transitions suaves y transforms

### Modelos de Datos

#### `src/app/models/gasolinera.interface.ts`
**Propósito**: Define la estructura de datos según la API gubernamental.

```typescript
export interface Gasolinera {
  IDEESS: string;                    // ID único estación
  'C.P.': string;                    // Código postal
  'Dirección': string;               // Dirección completa
  Horario: string;                   // Horario apertura
  Latitud: string;                   // Coordenada GPS
  'Longitud (WGS84)': string;       // Coordenada GPS
  Municipio: string;                 // Municipio
  'Precio Gasoleo A'?: string;      // Precio gasóleo A
  'Precio Gasoleo B'?: string;      // Precio gasóleo B
  'Precio Gasolina 95 E5'?: string; // Precio gasolina 95
  'Precio Gasolina 98 E5'?: string; // Precio gasolina 98
  Provincia: string;                 // Provincia
  'Rótulo': string;                 // Marca/nombre
  'Tipo Venta': string;             // Tipo venta
  distance?: number;                 // Campo calculado
}
```

**Características**:
- Nombres de campos en español (API oficial)
- Campos con espacios y acentos
- Precios opcionales (algunas estaciones no los tienen)
- Campo `distance` calculado dinámicamente

#### `src/app/models/location.interface.ts`
**Propósito**: Estructuras para manejo de ubicación.

```typescript
export interface UserLocation {
  latitude: number;   // Latitud decimal
  longitude: number;  // Longitud decimal
}

export interface LocationError {
  code: number;       // Código error GPS
  message: string;    // Mensaje descriptivo
}
```

### Servicios Especializados

#### `src/app/services/gasolinera.service.ts`
**Propósito**: Comunicación con API gubernamental y lógica de gasolineras.

**Inyección de Dependencias**:
```typescript
@Injectable({
  providedIn: 'root'
})
export class GasolineraService {
  private http = inject(HttpClient);
  private readonly API_URL = 'https://energia.serviciosmin.gob.es/...';
}
```

**Métodos Principales**:

1. **`getAllGasolineras(): Observable<Gasolinera[]>`**
   - Consume API REST del gobierno
   - Transforma datos de respuesta
   - Maneja errores de red

2. **`filterByFuelType(gasolineras: Gasolinera[], fuelType: string)`**
   - Filtra por tipo de combustible
   - Valida precios existentes

3. **`filterByBrand(gasolineras: Gasolinera[], brand: string)`**
   - Búsqueda flexible por marca
   - Normaliza nombres para comparación

4. **`getUniqueBrands(gasolineras: Gasolinera[]): string[]`**
   - Extrae marcas únicas
   - Ordena alfabéticamente

**Manejo de Errores**:
```typescript
private handleError(error: HttpErrorResponse) {
  if (error.error instanceof ErrorEvent) {
    // Error del cliente
    console.error('Error:', error.error.message);
  } else {
    // Error del servidor
    console.error(`Código ${error.status}, mensaje: ${error.error}`);
  }
  return throwError(() => 'Error al cargar datos. Intenta de nuevo.');
}
```

#### `src/app/services/location.service.ts`
**Propósito**: Geolocalización y cálculos de distancia.

**Características Principales**:

1. **`getCurrentLocation(): Promise<UserLocation>`**
   ```typescript
   getCurrentLocation(): Promise<UserLocation> {
     return new Promise((resolve, reject) => {
       if (!navigator.geolocation) {
         reject(new Error('Geolocalización no soportada'));
         return;
       }

       navigator.geolocation.getCurrentPosition(
         position => resolve({
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
         }),
         error => reject(this.getLocationError(error)),
         { timeout: 10000, enableHighAccuracy: true }
       );
     });
   }
   ```

2. **`calculateDistance(lat1, lon1, lat2, lon2): number`**
   ```typescript
   calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
     const R = 6371; // Radio Tierra en km
     const dLat = (lat2 - lat1) * Math.PI / 180;
     const dLon = (lon2 - lon1) * Math.PI / 180;

     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
       Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
       Math.sin(dLon/2) * Math.sin(dLon/2);

     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
     return R * c;
   }
   ```

3. **Validaciones y Utilidades**:
   - `isValidCoordinates()`: Valida rangos GPS
   - `getLocationError()`: Maneja errores de GPS
   - `toDMS()`: Convierte a grados/minutos/segundos

## 🌐 API del Gobierno

### Endpoint Principal
```
GET https://energia.serviciosmin.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/
```

### Estructura de Respuesta
```typescript
{
  "Fecha": "2025-12-19 10:30:15",
  "ListaEESSPrecio": [
    {
      "IDEESS": "4820",
      "Rótulo": "REPSOL",
      "Dirección": "AVENIDA VALENCIA, 16",
      "Municipio": "Caudete",
      "Provincia": "ALBACETE",
      "C.P.": "02660",
      "Precio Gasolina 95 E5": "1,465",
      "Precio Gasolina 98 E5": "1,525",
      "Precio Gasoleo A": "1,459",
      "Precio Gasoleo B": "1,329",
      "Latitud": "38,708944",
      "Longitud (WGS84)": "-0,982111",
      "Horario": "L-D: 06:00-22:00",
      "Tipo Venta": "P"
    }
  ],
  "Nota": "Precios válidos a la fecha y hora indicadas",
  "ResultadoConsulta": "OK"
}
```

### Características de la API
- **Oficial**: Ministerio de Industria, Comercio y Turismo
- **Actualización**: Datos en tiempo real
- **Cobertura**: Nacional (todas las CCAA)
- **Formato**: JSON estructurado
- **Acceso**: Público, sin autenticación
- **CORS**: Habilitado para navegadores

## ⚡ Funcionalidades Avanzadas

### Sistema de Filtros Múltiples
```typescript
applyFilters(): void {
  let filtered = this.gasolineras();

  // Filtro por ubicación y radio
  if (this.userLocation()) {
    filtered = filtered.filter(g => g.distance! <= this.searchForm.get('radius')?.value);
  }

  // Filtro por texto (marca, dirección, municipio)
  const textSearch = this.searchForm.get('textSearch')?.value?.toLowerCase();
  if (textSearch) {
    filtered = filtered.filter(g => 
      g['Rótulo'].toLowerCase().includes(textSearch) ||
      g['Dirección'].toLowerCase().includes(textSearch) ||
      g.Municipio.toLowerCase().includes(textSearch)
    );
  }

  // Filtro por marca específica
  const brand = this.searchForm.get('brand')?.value;
  if (brand) {
    filtered = this.gasolineraService.filterByBrand(filtered, brand);
  }

  // Filtro por tipo de combustible
  const fuelType = this.searchForm.get('fuelType')?.value;
  if (fuelType) {
    filtered = this.gasolineraService.filterByFuelType(filtered, fuelType);
  }

  // Filtro por rango de precio
  const minPrice = this.searchForm.get('minPrice')?.value;
  const maxPrice = this.searchForm.get('maxPrice')?.value;
  if (minPrice !== null || maxPrice !== null) {
    filtered = filtered.filter(g => {
      const price = this.getLowestPrice(g);
      if (price === null) return false;
      return (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
    });
  }

  // Aplicar ordenamiento
  this.sortGasolineras(filtered);
}
```

### Algoritmo Haversine Avanzado
```typescript
// Implementación completa con validaciones
private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  // Validar coordenadas
  if (!this.locationService.isValidCoordinates(lat1, lon1) || 
      !this.locationService.isValidCoordinates(lat2, lon2)) {
    return Infinity;
  }

  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

### Gestión de Estado Reactivo
```typescript
// Signals para estado reactivo
gasolineras = signal<Gasolinera[]>([]);
filteredGasolineras = signal<Gasolinera[]>([]);
loading = signal(false);
error = signal<string>('');

// Efectos reactivos
constructor() {
  // Auto-aplicar filtros cuando cambian los datos
  effect(() => {
    if (this.gasolineras().length > 0) {
      this.applyFilters();
    }
  });

  // Escuchar cambios en el formulario
  this.searchForm.valueChanges.subscribe(() => {
    this.applyFilters();
  });
}
```

### Sistema de Validación Avanzada
```typescript
// Validadores personalizados
const coordinateValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === '') return null;
  
  const num = parseFloat(value);
  if (isNaN(num)) return { invalidNumber: true };
  
  return null;
};

// Aplicación en formulario
searchForm = this.fb.group({
  latitude: ['', [
    Validators.required, 
    Validators.min(-90), 
    Validators.max(90),
    coordinateValidator
  ]],
  longitude: ['', [
    Validators.required, 
    Validators.min(-180), 
    Validators.max(180),
    coordinateValidator
  ]],
  // ... más campos
});
```

## 📜 Scripts y Comandos

### Scripts de Desarrollo
```bash
# Desarrollo
npm start                    # Servidor dev en puerto 4201
npm run watch               # Build watch mode
ng serve --open             # Abrir navegador automáticamente
ng serve --host 0.0.0.0     # Acceso desde red local

# Construcción
npm run build               # Build producción optimizado
ng build --configuration development  # Build desarrollo
ng build --stats-json       # Build con estadísticas

# Testing
npm test                    # Tests unitarios
ng test --watch=false       # Tests una sola vez
ng test --code-coverage     # Tests con cobertura
ng e2e                      # Tests end-to-end

# Herramientas
ng lint                     # Linting código
ng update                   # Actualizar dependencias
ng add @angular/pwa         # Añadir PWA
ng generate --help          # Ayuda generadores
```

### Comandos Angular CLI Útiles
```bash
# Generar componentes
ng generate component mi-componente
ng g c mi-componente --standalone
ng g c mi-componente --skip-tests

# Generar servicios
ng generate service servicios/mi-servicio
ng g s servicios/mi-servicio --skip-tests

# Generar interfaces
ng generate interface models/mi-interface
ng g i models/mi-interface

# Análisis del bundle
ng build --source-map
ng build --vendor-chunk
npx webpack-bundle-analyzer dist/api-gob-oil/
```

## 🔧 Mantenimiento y Extensión

### Agregar Nuevos Filtros
1. **Añadir campo al formulario**:
   ```typescript
   searchForm = this.fb.group({
     // ... campos existentes
     nuevoFiltro: ['']
   });
   ```

2. **Implementar lógica en `applyFilters()`**:
   ```typescript
   const nuevoFiltro = this.searchForm.get('nuevoFiltro')?.value;
   if (nuevoFiltro) {
     filtered = filtered.filter(g => /* lógica del filtro */);
   }
   ```

3. **Agregar control en template**:
   ```html
   <select formControlName="nuevoFiltro">
     <!-- opciones -->
   </select>
   ```

### Integrar Nueva API
1. **Crear interface en `models/`**
2. **Implementar servicio en `services/`**
3. **Actualizar lógica en componente principal**
4. **Añadir tests unitarios**

### Optimizaciones de Performance
- **OnPush Change Detection**: Para componentes hijos
- **TrackBy Functions**: En listas grandes
- **Lazy Loading**: Para módulos grandes
- **Service Workers**: Para cache offline
- **Compression**: Gzip/Brotli en servidor

---

## 🎯 Casos de Uso

### Buscar Gasolinera Más Barata
1. Permitir ubicación GPS
2. Establecer radio de búsqueda
3. Ordenar por precio
4. Filtrar por tipo de combustible

### Encontrar Gasolineras 24h
1. Buscar "24" en filtro de texto
2. Revisar campo horario en resultados

### Comparar Precios por Marca
1. Seleccionar marca específica
2. Ordenar por precio
3. Comparar con "Todas las marcas"

---

**Desarrollado con ❤️ usando Angular 21, TypeScript y la API oficial del Gobierno de España**

*Última actualización: Diciembre 2024*
