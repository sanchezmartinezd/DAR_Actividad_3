export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source: 'gps' | 'manual' | 'ip';
  address?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface IPLocationResponse {
  lat: number;
  lon: number;
  city: string;
  region: string;
  country: string;
  timezone: string;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface RouteSearch {
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  maxDetour: number; // km máximo de desvío
}
