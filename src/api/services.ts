import { httpClient } from './httpClient';
import type {
   AlertAiSummaryResponse,
  AlertResponse,
  AlertStatus,
  AlertType,
  AlertUpdateRequest,
  CollarRequest,
  CollarResponse,
  CowRequest,
  CowResponse,
  DashboardSummary,
  GeofenceRequest,
  GeofenceResponse,
  LocationRequest,
  LocationResponse,
  LoginRequest,
  LoginResponse,
  Page,
  UserCreateRequest,
  UserResponse,
} from '../types';

const pageOf = <T,>(data: any): Page<T> => ({
  content: data.content ?? [],
  totalElements: data.totalElements ?? 0,
  totalPages: data.totalPages ?? 0,
  number: data.number ?? 0,
  size: data.size ?? 0,
  first: data.first ?? true,
  last: data.last ?? true,
});

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post('/api/auth/login', {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });
    return response.data as LoginResponse;
  }

  static async me(): Promise<UserResponse> {
    const response = await httpClient.get('/api/auth/me');
    return response.data as UserResponse;
  }

  static async logout(): Promise<void> {
    localStorage.removeItem('ganaderia_session');
  }
}

export class UserService {
  static async create(data: UserCreateRequest): Promise<UserResponse> {
    const response = await httpClient.post('/api/users', data);
    return response.data as UserResponse;
  }

  static async getAll(): Promise<UserResponse[]> {
    const response = await httpClient.get('/api/users');
    return response.data as UserResponse[];
  }

  static async getById(id: number): Promise<UserResponse> {
    const response = await httpClient.get(`/api/users/${id}`);
    return response.data as UserResponse;
  }

  static async getByActive(active: boolean): Promise<UserResponse[]> {
    const response = await httpClient.get(`/api/users/active/${active}`);
    return response.data as UserResponse[];
  }
}

export class CowService {
  static async create(data: CowRequest): Promise<CowResponse> {
    const response = await httpClient.post('/api/cows', data);
    return response.data as CowResponse;
  }

  static async update(id: number, data: CowRequest): Promise<CowResponse> {
    const response = await httpClient.put(`/api/cows/${id}`, data);
    return response.data as CowResponse;
  }

  static async getAll(): Promise<CowResponse[]> {
    const response = await httpClient.get('/api/cows');
    return response.data as CowResponse[];
  }

  static async getById(id: number): Promise<CowResponse> {
    const response = await httpClient.get(`/api/cows/${id}`);
    return response.data as CowResponse;
  }
}

export class CollarService {
  static async create(data: CollarRequest): Promise<CollarResponse> {
    const response = await httpClient.post('/api/collars', data);
    return response.data as CollarResponse;
  }

  static async update(id: number, data: CollarRequest): Promise<CollarResponse> {
    const response = await httpClient.put(`/api/collars/${id}`, data);
    return response.data as CollarResponse;
  }

  static async enable(id: number): Promise<CollarResponse> {
    const response = await httpClient.patch(`/api/collars/${id}/enable`);
    return response.data as CollarResponse;
  }

  static async disable(id: number): Promise<CollarResponse> {
    const response = await httpClient.patch(`/api/collars/${id}/disable`);
    return response.data as CollarResponse;
  }

  static async reassign(id: number, cowId: number): Promise<CollarResponse> {
    const response = await httpClient.patch(`/api/collars/${id}/assign/${cowId}`);
    return response.data as CollarResponse;
  }

  static async getAll(): Promise<CollarResponse[]> {
    const response = await httpClient.get('/api/collars');
    return response.data as CollarResponse[];
  }

  static async getById(id: number): Promise<CollarResponse> {
    const response = await httpClient.get(`/api/collars/${id}`);
    return response.data as CollarResponse;
  }
}

export class GeofenceService {
  static async create(data: GeofenceRequest): Promise<GeofenceResponse> {
    const response = await httpClient.post('/api/geofences', data);
    return response.data as GeofenceResponse;
  }

  static async getAll(): Promise<GeofenceResponse[]> {
    const response = await httpClient.get('/api/geofences');
    return response.data as GeofenceResponse[];
  }

  static async getById(id: number): Promise<GeofenceResponse> {
    const response = await httpClient.get(`/api/geofences/${id}`);
    return response.data as GeofenceResponse;
  }

  static async getByActive(active: boolean): Promise<GeofenceResponse[]> {
    const response = await httpClient.get(`/api/geofences/active/${active}`);
    return response.data as GeofenceResponse[];
  }
}

export class AlertService {
  static async getAll(): Promise<AlertResponse[]> {
    const response = await httpClient.get('/api/alerts');
    return response.data as AlertResponse[];
  }

  static async getPage(params: {
    status?: AlertStatus;
    type?: AlertType;
    page?: number;
    size?: number;
  }): Promise<Page<AlertResponse>> {
    const response = await httpClient.get('/api/alerts/page', { params });
    return pageOf<AlertResponse>(response.data);
  }

  static async getById(id: number): Promise<AlertResponse> {
    const response = await httpClient.get(`/api/alerts/${id}`);
    return response.data as AlertResponse;
  }

  static async update(id: number, data: AlertUpdateRequest): Promise<AlertResponse> {
    const response = await httpClient.put(`/api/alerts/${id}`, data);
    return response.data as AlertResponse;
  }

  static async resolve(id: number, observations?: string): Promise<AlertResponse> {
    const response = await httpClient.patch(`/api/alerts/${id}/resolve`, null, {
      params: observations ? { observations } : undefined,
    });
    return response.data as AlertResponse;
  }

  static async discard(id: number, observations?: string): Promise<AlertResponse> {
    const response = await httpClient.patch(`/api/alerts/${id}/discard`, null, {
      params: observations ? { observations } : undefined,
    });
    return response.data as AlertResponse;
  }
}
export class AlertAnalysisService {
  static async getAiSummary(): Promise<AlertAiSummaryResponse> {
    const response = await httpClient.get('/api/alert-analysis/ai-summary');
    return response.data as AlertAiSummaryResponse;
  }
}
export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    const response = await httpClient.get('/api/dashboard/summary');
    return response.data as DashboardSummary;
  }
  static async getCriticalAlerts(): Promise<AlertResponse[]> {
    const response = await httpClient.get('/api/dashboard/critical-alerts');
    return response.data as AlertResponse[];
  }

  static async getOfflineCollars(): Promise<CollarResponse[]> {
    const response = await httpClient.get('/api/dashboard/collars-offline');
    return response.data as CollarResponse[];
  }

  static async getCowsOutsideGeofence(): Promise<CowResponse[]> {
    const response = await httpClient.get('/api/dashboard/cows-outside-geofence');
    return response.data as CowResponse[];
  }

  static async getRecentLocations(): Promise<LocationResponse[]> {
    const response = await httpClient.get('/api/dashboard/recent-locations');
    return response.data as LocationResponse[];
  }
}

export class LocationService {
  static async register(data: LocationRequest): Promise<LocationResponse> {
    const response = await httpClient.post('/api/locations', {
      cowId: data.cowId,
      latitude: data.latitude,
      longitude: data.longitude,
      recordedAt: data.recordedAt ?? new Date().toISOString(),
    });
    return response.data as LocationResponse;
  }

  static async getByCow(cowId: number, page = 0, size = 10): Promise<Page<LocationResponse>> {
    const response = await httpClient.get(`/api/locations/cow/${cowId}`, {
      params: { page, size },
    });
    return pageOf<LocationResponse>(response.data);
  }

  static async getLastByCow(cowId: number): Promise<LocationResponse> {
    const response = await httpClient.get(`/api/locations/cow/${cowId}/last`);
    return response.data as LocationResponse;
  }
}

export class ReportService {
  static async getAlertsPage(params?: Record<string, string | number | boolean | undefined>) {
    const response = await httpClient.get('/api/reports/alerts/page', { params });
    return pageOf<AlertResponse>(response.data);
  }

  static async getAlertsTrend(params?: Record<string, string | number | boolean | undefined>) {
    const response = await httpClient.get('/api/reports/alerts/trend', { params });
    return response.data;
  }

  static async getAlertsTypeRecurrence(params?: Record<string, string | number | boolean | undefined>) {
    const response = await httpClient.get('/api/reports/alerts/type-recurrence', { params });
    return response.data;
  }

  static async getOfflineCollars(params?: Record<string, string | number | boolean | undefined>) {
    const response = await httpClient.get('/api/reports/offline-collars', { params });
    return response.data;
  }

  static async getCowsMostIncidents(params?: Record<string, string | number | boolean | undefined>) {
    const response = await httpClient.get('/api/reports/cows-most-incidents', { params });
    return response.data;
  }
}
