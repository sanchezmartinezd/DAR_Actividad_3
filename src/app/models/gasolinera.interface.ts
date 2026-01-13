export interface Gasolinera {
  IDEESS: string;
  'C.P.': string;
  'Dirección': string;
  Horario: string;
  Latitud: string;
  Localidad: string;
  'Longitud (WGS84)': string;
  Margen: string;
  Municipio: string;
  'Precio Gasoleo A'?: string;
  'Precio Gasoleo B'?: string;
  'Precio Gasolina 95 E5'?: string;
  'Precio Gasolina 98 E5'?: string;
  'Precio Gasolina 95 E10'?: string;
  'Precio Gasolina 98 E10'?: string;
  'Precio Biodiesel'?: string;
  'Precio GLP'?: string;
  'Precio GNC'?: string;
  'Precio GNL'?: string;
  'Precio Hidrogeno'?: string;
  Provincia: string;
  'Remisión': string;
  'Rótulo': string;
  'Tipo Venta': string;
  'IDMUNICIPIO'?: string;
  'IDPROVINCIA'?: string;
  'IDCCAA'?: string;

  // Campos adicionales calculados
  distance?: number;
  isOpen?: boolean;
  cheapestFuel?: {
    type: string;
    price: number;
  };
}

export interface ComunidadAutonoma {
  IDCCAA: string;
  CCAA: string;
}

export interface Provincia {
  IDProvincia: string;
  Provincia: string;
  IDCCAA: string;
}

export interface Municipio {
  IDMunicipio: string;
  Municipio: string;
  IDProvincia: string;
  IDCCAA: string;
}

export interface ProductoPetrolifero {
  IDProducto: string;
  NombreProducto: string;
  NombreProductoAbreviatura: string;
}

export interface ApiResponse<T = Gasolinera> {
  Fecha: string;
  ListaEESSPrecio?: T[];
  Nota: string;
  ResultadoConsulta: string;
}

export interface FilterOptions {
  ccaaId?: string;
  provinciaId?: string;
  municipioId?: string;
  productoId?: string;
  empresasWhitelist?: string[];
  empresasBlacklist?: string[];
  radius?: number;
  onlyOpen?: boolean;
  sortBy?: 'distance' | 'price' | 'name';
  maxResults?: number;
}
