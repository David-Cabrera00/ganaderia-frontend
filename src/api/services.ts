import type {
  LoginRequest,
  LoginResponse,
  UserResponse,
  UserCreateRequest,
  CowResponse,
  CowRequest,
  CollarResponse,
  CollarRequest,
  GeofenceResponse,
  GeofenceRequest,
  AlertResponse,
  AlertUpdateRequest,
  AlertStatus,
  AlertType,
  LocationResponse,
  LocationRequest,
  DashboardSummary,
  CollarStatus,
  CowStatus,
  Page,
  DeviceSignalStatus,
} from '../types';

interface MockUserRecord extends UserResponse {
  password: string;
}

interface MockDatabase {
  users: MockUserRecord[];
  cows: CowResponse[];
  collars: CollarResponse[];
  geofences: GeofenceResponse[];
  alerts: AlertResponse[];
  locations: LocationResponse[];
}

const DB_KEY = 'ganaderia_mock_db';
const SESSION_KEY = 'auth-storage';
const DEMO_PASSWORD = 'Admin12345';

const nowIso = () => new Date().toISOString();
const delay = async (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const nextId = (items: Array<{ id: number }>) =>
  items.length === 0 ? 1 : Math.max(...items.map((item) => item.id)) + 1;

const paginate = <T,>(items: T[], page = 0, size = 10): Page<T> => {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * size;
  const content = items.slice(start, start + size);

  return {
    content,
    totalElements,
    totalPages,
    number: safePage,
    size,
    first: safePage === 0,
    last: safePage >= totalPages - 1,
  };
};

const seedDatabase = (): MockDatabase => ({
  users: [
    { id: 1, name: 'Administrador General', email: 'admin@ganaderia.com', role: 'ADMINISTRADOR', active: true, password: DEMO_PASSWORD },
    { id: 2, name: 'Supervisor Campo', email: 'supervisor@ganaderia.com', role: 'SUPERVISOR', active: true, password: DEMO_PASSWORD },
    { id: 3, name: 'Operador Norte', email: 'operador@ganaderia.com', role: 'OPERADOR', active: true, password: DEMO_PASSWORD },
    { id: 4, name: 'Técnico GPS', email: 'tecnico@ganaderia.com', role: 'TECNICO', active: true, password: DEMO_PASSWORD },
  ],
  cows: [
    { id: 1, token: 'COW-001', internalCode: 'INT-001', name: 'Lucera', status: 'DENTRO', observations: 'En monitoreo normal' },
    { id: 2, token: 'COW-002', internalCode: 'INT-002', name: 'Estrella', status: 'FUERA', observations: 'Se alejó del perímetro norte' },
    { id: 3, token: 'COW-003', internalCode: 'INT-003', name: 'Mora', status: 'SIN_UBICACION', observations: 'Pendiente registro reciente' },
    { id: 4, token: 'COW-004', internalCode: 'INT-004', name: 'Canela', status: 'DENTRO', observations: null },
  ],
  collars: [
    {
      id: 1,
      token: 'COL-001',
      status: 'ACTIVO',
      cowId: 1,
      cowToken: 'COW-001',
      cowName: 'Lucera',
      batteryLevel: 82,
      lastSeenAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      signalStatus: 'FUERTE',
      firmwareVersion: 'v1.4.2',
      gpsAccuracy: 2.1,
      enabled: true,
      notes: 'Operativo',
    },
    {
      id: 2,
      token: 'COL-002',
      status: 'ACTIVO',
      cowId: 2,
      cowToken: 'COW-002',
      cowName: 'Estrella',
      batteryLevel: 18,
      lastSeenAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      signalStatus: 'SIN_SENAL',
      firmwareVersion: 'v1.4.0',
      gpsAccuracy: 6.4,
      enabled: true,
      notes: 'Sin señal desde la madrugada',
    },
    {
      id: 3,
      token: 'COL-003',
      status: 'MANTENIMIENTO',
      cowId: null,
      cowToken: null,
      cowName: null,
      batteryLevel: 55,
      lastSeenAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      signalStatus: 'DEBIL',
      firmwareVersion: 'v1.3.1',
      gpsAccuracy: 4.2,
      enabled: false,
      notes: 'Pendiente revisión técnica',
    },
  ],
  geofences: [
    { id: 1, name: 'Potrero Norte', centerLatitude: 1.2136, centerLongitude: -77.2811, radiusMeters: 500, active: true, cowId: 1, cowToken: 'COW-001', cowName: 'Lucera' },
    { id: 2, name: 'Potrero Central', centerLatitude: 1.2093, centerLongitude: -77.2784, radiusMeters: 650, active: true, cowId: 4, cowToken: 'COW-004', cowName: 'Canela' },
    { id: 3, name: 'Corral de revisión', centerLatitude: 1.2151, centerLongitude: -77.2835, radiusMeters: 150, active: false, cowId: null, cowToken: null, cowName: null },
  ],
  alerts: [
    {
      id: 1,
      type: 'EXIT_GEOFENCE',
      message: 'La vaca Estrella salió de la geocerca asignada.',
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      status: 'PENDIENTE',
      observations: null,
      cowId: 2,
      cowToken: 'COW-002',
      cowName: 'Estrella',
      locationId: 2,
    },
    {
      id: 2,
      type: 'COLLAR_OFFLINE',
      message: 'El collar COL-002 perdió conectividad.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'PENDIENTE',
      observations: null,
      cowId: 2,
      cowToken: 'COW-002',
      cowName: 'Estrella',
      locationId: null,
    },
    {
      id: 3,
      type: 'EXIT_GEOFENCE',
      message: 'Evento histórico ya resuelto.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'RESUELTA',
      observations: 'Animal regresó al área segura.',
      cowId: 1,
      cowToken: 'COW-001',
      cowName: 'Lucera',
      locationId: 1,
    },
  ],
  locations: [
    { id: 1, cowId: 1, cowToken: 'COW-001', cowName: 'Lucera', latitude: 1.2132, longitude: -77.2804, recordedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), insideGeofence: true },
    { id: 2, cowId: 2, cowToken: 'COW-002', cowName: 'Estrella', latitude: 1.2219, longitude: -77.2918, recordedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(), insideGeofence: false },
    { id: 3, cowId: 4, cowToken: 'COW-004', cowName: 'Canela', latitude: 1.2091, longitude: -77.2782, recordedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), insideGeofence: true },
    { id: 4, cowId: 1, cowToken: 'COW-001', cowName: 'Lucera', latitude: 1.2135, longitude: -77.2807, recordedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), insideGeofence: true },
    { id: 5, cowId: 2, cowToken: 'COW-002', cowName: 'Estrella', latitude: 1.2224, longitude: -77.2920, recordedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), insideGeofence: false },
  ],
});

const readDb = (): MockDatabase => {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    return JSON.parse(raw) as MockDatabase;
  } catch {
    const seeded = seedDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
};

const writeDb = (db: MockDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const currentSessionUserId = (): number | null => {
  const keys = [SESSION_KEY, 'ganaderia_local_session', 'ganaderia_session', 'user'];

  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as {
        state?: { session?: { id?: number } };
        session?: { id?: number };
        id?: number;
      };

      const id = parsed?.state?.session?.id ?? parsed?.session?.id ?? parsed?.id ?? null;
      if (typeof id === 'number') return id;
    } catch {
      continue;
    }
  }

  return null;
};

const publicUser = (user: MockUserRecord): UserResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  active: user.active,
});

const ensureCowAlerts = (db: MockDatabase) => {
  db.cows
    .filter((cow) => cow.status === 'FUERA')
    .forEach((cow) => {
      const exists = db.alerts.some(
        (alert) => alert.type === 'EXIT_GEOFENCE' && alert.status === 'PENDIENTE' && alert.cowId === cow.id,
      );

      if (!exists) {
        db.alerts.unshift({
          id: nextId(db.alerts),
          type: 'EXIT_GEOFENCE',
          message: `La vaca ${cow.name} salió de la geocerca asignada.`,
          createdAt: nowIso(),
          status: 'PENDIENTE',
          observations: null,
          cowId: cow.id,
          cowToken: cow.token,
          cowName: cow.name,
          locationId: null,
        });
      }
    });
};

const ensureCollarAlerts = (db: MockDatabase) => {
  db.collars
    .filter((collar) => collar.signalStatus === 'SIN_SENAL' || !collar.enabled)
    .forEach((collar) => {
      const exists = db.alerts.some(
        (alert) => alert.type === 'COLLAR_OFFLINE' && alert.status === 'PENDIENTE' && alert.cowId === collar.cowId,
      );

      if (!exists) {
        db.alerts.unshift({
          id: nextId(db.alerts),
          type: 'COLLAR_OFFLINE',
          message: `El collar ${collar.token} perdió conectividad.`,
          createdAt: nowIso(),
          status: 'PENDIENTE',
          observations: null,
          cowId: collar.cowId,
          cowToken: collar.cowToken,
          cowName: collar.cowName,
          locationId: null,
        });
      }
    });
};

const syncDb = (db: MockDatabase) => {
  db.collars = db.collars.map((collar) => {
    const cow = collar.cowId ? db.cows.find((item) => item.id === collar.cowId) : null;
    let signalStatus: DeviceSignalStatus | null = collar.signalStatus ?? null;

    if (!collar.enabled) signalStatus = 'SIN_SENAL';
    else if (collar.batteryLevel !== null && collar.batteryLevel !== undefined && collar.batteryLevel < 20) signalStatus = 'DEBIL';
    else if (!signalStatus) signalStatus = 'FUERTE';

    return {
      ...collar,
      cowToken: cow?.token ?? null,
      cowName: cow?.name ?? null,
      signalStatus,
      lastSeenAt: collar.lastSeenAt ?? nowIso(),
    };
  });

  db.geofences = db.geofences.map((geofence) => {
    const cow = geofence.cowId ? db.cows.find((item) => item.id === geofence.cowId) : null;
    return {
      ...geofence,
      cowToken: cow?.token ?? null,
      cowName: cow?.name ?? null,
    };
  });

  db.alerts = db.alerts.map((alert) => {
    const cow = alert.cowId ? db.cows.find((item) => item.id === alert.cowId) : null;
    return {
      ...alert,
      cowToken: cow?.token ?? alert.cowToken ?? null,
      cowName: cow?.name ?? alert.cowName ?? null,
    };
  });

  ensureCowAlerts(db);
  ensureCollarAlerts(db);
  writeDb(db);
};

const getDb = () => {
  const db = readDb();
  syncDb(db);
  return readDb();
};

const throwIf = (condition: boolean, message: string) => {
  if (condition) throw new Error(message);
};

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];

    const email = data.email.trim().toLowerCase();
    const user = db.users.find((item) => item.email.toLowerCase() === email && item.active);

    if (!user || user.password !== data.password) {
      throw new Error('Credenciales inválidas. Usa admin@ganaderia.com / Admin12345');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: `local-token-${user.id}`,
      tokenType: 'Bearer',
      expiresIn: 24 * 60 * 60 * 1000,
      message: 'Inicio de sesión exitoso',
    };
  }

  static async me(): Promise<UserResponse> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];

    const userId = currentSessionUserId();
    const user = db.users.find((item) => item.id === userId);

    if (!user) {
      throw new Error('No hay una sesión local válida.');
    }

    return publicUser(user);
  }

  static async logout(): Promise<void> {
    await delay();
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('ganaderia_local_session');
    localStorage.removeItem('ganaderia_session');
    localStorage.removeItem('user');
  }
}

export class UserService {
  static async create(data: UserCreateRequest): Promise<UserResponse> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];

    const email = data.email.trim().toLowerCase();

    throwIf(
      db.users.some((user) => user.email.toLowerCase() === email),
      'Ya existe un usuario con ese correo.',
    );

    const user: MockUserRecord = {
      id: nextId(db.users),
      name: data.name.trim(),
      email,
      password: data.password,
      role: data.role,
      active: data.active ?? true,
    };

    db.users.unshift(user);
    writeDb(db);
    return clone(publicUser(user));
  }

  static async getAll(): Promise<UserResponse[]> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];
    return clone(db.users.map(publicUser));
  }

  static async getById(id: number): Promise<UserResponse> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];

    const user = db.users.find((item) => item.id === id);
    if (!user) throw new Error('Usuario no encontrado.');
    return clone(publicUser(user));
  }

  static async getByActive(active: boolean): Promise<UserResponse[]> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];
    return clone(db.users.filter((item) => item.active === active).map(publicUser));
  }

  static async update(id: number, data: Partial<UserCreateRequest>): Promise<UserResponse> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];

    const index = db.users.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Usuario no encontrado.');

    const current = db.users[index];
    const nextEmail = (data.email ?? current.email).trim().toLowerCase();

    throwIf(
      db.users.some((user) => user.id !== id && user.email.toLowerCase() === nextEmail),
      'Ya existe un usuario con ese correo.',
    );

    db.users[index] = {
      ...current,
      name: data.name !== undefined ? data.name.trim() : current.name,
      email: nextEmail,
      role: data.role ?? current.role,
      password:
        data.password !== undefined && data.password.trim() !== ''
          ? data.password.trim()
          : current.password,
      active: typeof data.active === 'boolean' ? data.active : current.active,
    };

    writeDb(db);
    return clone(publicUser(db.users[index]));
  }

  static async toggleActive(id: number): Promise<UserResponse> {
    await delay();
    const db = getDb();
    db.users = Array.isArray(db.users) ? db.users : [];

    const index = db.users.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Usuario no encontrado.');

    db.users[index] = {
      ...db.users[index],
      active: !db.users[index].active,
    };

    writeDb(db);
    return clone(publicUser(db.users[index]));
  }
}

export class CowService {
  static async create(data: CowRequest): Promise<CowResponse> {
    await delay();
    const db = getDb();
    const token = data.token.trim().toUpperCase();
    const internalCode = data.internalCode?.trim() || null;

    throwIf(db.cows.some((cow) => cow.token.toUpperCase() === token), 'Ya existe una vaca con ese token.');
    if (internalCode) throwIf(db.cows.some((cow) => (cow.internalCode ?? '').toUpperCase() === internalCode.toUpperCase()), 'Ya existe una vaca con ese código interno.');

    const cow: CowResponse = {
      id: nextId(db.cows),
      token,
      internalCode,
      name: data.name.trim(),
      status: data.status,
      observations: data.observations?.trim() || null,
    };

    db.cows.unshift(cow);
    syncDb(db);
    return clone(cow);
  }

  static async update(id: number, data: CowRequest): Promise<CowResponse> {
    await delay();
    const db = getDb();
    const index = db.cows.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Vaca no encontrada.');

    const token = data.token.trim().toUpperCase();
    const internalCode = data.internalCode?.trim() || null;

    throwIf(db.cows.some((cow) => cow.id !== id && cow.token.toUpperCase() === token), 'Ya existe una vaca con ese token.');
    if (internalCode) throwIf(db.cows.some((cow) => cow.id !== id && (cow.internalCode ?? '').toUpperCase() === internalCode.toUpperCase()), 'Ya existe una vaca con ese código interno.');

    db.cows[index] = {
      ...db.cows[index],
      token,
      internalCode,
      name: data.name.trim(),
      status: data.status,
      observations: data.observations?.trim() || null,
    };

    syncDb(db);
    return clone(db.cows[index]);
  }

  static async getAll(): Promise<CowResponse[]> {
    await delay();
    return clone(getDb().cows);
  }

  static async getById(id: number): Promise<CowResponse> {
    await delay();
    const cow = getDb().cows.find((item) => item.id === id);
    if (!cow) throw new Error('Vaca no encontrada.');
    return clone(cow);
  }

  static async getByStatus(status: CowStatus): Promise<CowResponse[]> {
    await delay();
    return clone(getDb().cows.filter((item) => item.status === status));
  }

  static async getByToken(token: string): Promise<CowResponse> {
    await delay();
    const cow = getDb().cows.find((item) => item.token === token);
    if (!cow) throw new Error('Vaca no encontrada.');
    return clone(cow);
  }
}

export class CollarService {
  static async create(data: CollarRequest): Promise<CollarResponse> {
    await delay();
    const db = getDb();
    const token = data.token.trim().toUpperCase();
    throwIf(db.collars.some((collar) => collar.token.toUpperCase() === token), 'Ya existe un collar con ese token.');
    throwIf(!token.startsWith('COL-'), 'El token del collar debe iniciar con COL-.');
    throwIf(db.cows.some((cow) => cow.token.toUpperCase() === token), 'Ese token ya está siendo usado por una vaca.');

    const collar: CollarResponse = {
      id: nextId(db.collars),
      token,
      status: data.status,
      cowId: data.cowId ?? null,
      cowToken: null,
      cowName: null,
      batteryLevel: data.batteryLevel ?? null,
      lastSeenAt: nowIso(),
      signalStatus: (data.enabled ?? true) ? 'FUERTE' : 'SIN_SENAL',
      firmwareVersion: data.firmwareVersion?.trim() || null,
      gpsAccuracy: 2.5,
      enabled: data.enabled ?? true,
      notes: data.notes?.trim() || null,
    };

    db.collars.unshift(collar);
    syncDb(db);
    return clone(db.collars[0]);
  }

  static async update(id: number, data: CollarRequest): Promise<CollarResponse> {
    await delay();
    const db = getDb();
    const index = db.collars.findIndex((item) => item.id === id);
    if (index === -1) throw new Error('Collar no encontrado.');
    const token = data.token.trim().toUpperCase();

    throwIf(db.collars.some((collar) => collar.id !== id && collar.token.toUpperCase() === token), 'Ya existe un collar con ese token.');
    throwIf(!token.startsWith('COL-'), 'El token del collar debe iniciar con COL-.');
    throwIf(db.cows.some((cow) => cow.token.toUpperCase() === token), 'Ese token ya está siendo usado por una vaca.');

    db.collars[index] = {
      ...db.collars[index],
      token,
      status: data.status,
      cowId: data.cowId ?? null,
      batteryLevel: data.batteryLevel ?? null,
      firmwareVersion: data.firmwareVersion?.trim() || null,
      notes: data.notes?.trim() || null,
      enabled: data.enabled ?? db.collars[index].enabled,
      lastSeenAt: nowIso(),
    };

    syncDb(db);
    return clone(db.collars.find((item) => item.id === id)!);
  }

  static async enable(id: number): Promise<CollarResponse> {
    await delay();
    const db = getDb();
    const collar = db.collars.find((item) => item.id === id);
    if (!collar) throw new Error('Collar no encontrado.');
    collar.enabled = true;
    collar.signalStatus = 'FUERTE';
    collar.lastSeenAt = nowIso();
    syncDb(db);
    return clone(collar);
  }

  static async disable(id: number): Promise<CollarResponse> {
    await delay();
    const db = getDb();
    const collar = db.collars.find((item) => item.id === id);
    if (!collar) throw new Error('Collar no encontrado.');
    collar.enabled = false;
    collar.signalStatus = 'SIN_SENAL';
    syncDb(db);
    return clone(collar);
  }

  static async reassign(id: number, cowId: number): Promise<CollarResponse> {
    await delay();
    const db = getDb();
    const collar = db.collars.find((item) => item.id === id);
    const cow = db.cows.find((item) => item.id === cowId);
    if (!collar) throw new Error('Collar no encontrado.');
    if (!cow) throw new Error('Vaca no encontrada.');
    collar.cowId = cowId;
    syncDb(db);
    return clone(db.collars.find((item) => item.id === id)!);
  }

  static async getAll(): Promise<CollarResponse[]> {
    await delay();
    return clone(getDb().collars);
  }

  static async getById(id: number): Promise<CollarResponse> {
    await delay();
    const collar = getDb().collars.find((item) => item.id === id);
    if (!collar) throw new Error('Collar no encontrado.');
    return clone(collar);
  }

  static async getByStatus(status: CollarStatus): Promise<CollarResponse[]> {
    await delay();
    return clone(getDb().collars.filter((item) => item.status === status));
  }

  static async getByToken(token: string): Promise<CollarResponse> {
    await delay();
    const collar = getDb().collars.find((item) => item.token === token);
    if (!collar) throw new Error('Collar no encontrado.');
    return clone(collar);
  }
}

export class GeofenceService {
  static async create(data: GeofenceRequest): Promise<GeofenceResponse> {
    await delay();
    const db = getDb();
    const geofence: GeofenceResponse = {
      id: nextId(db.geofences),
      name: data.name.trim(),
      centerLatitude: data.centerLatitude,
      centerLongitude: data.centerLongitude,
      radiusMeters: data.radiusMeters,
      active: data.active,
      cowId: data.cowId ?? null,
      cowToken: null,
      cowName: null,
    };
    db.geofences.unshift(geofence);
    syncDb(db);
    return clone(db.geofences[0]);
  }

  static async getAll(): Promise<GeofenceResponse[]> {
    await delay();
    return clone(getDb().geofences);
  }

  static async getById(id: number): Promise<GeofenceResponse> {
    await delay();
    const geofence = getDb().geofences.find((item) => item.id === id);
    if (!geofence) throw new Error('Geocerca no encontrada.');
    return clone(geofence);
  }

  static async getByActive(active: boolean): Promise<GeofenceResponse[]> {
    await delay();
    return clone(getDb().geofences.filter((item) => item.active === active));
  }
}

export class AlertService {
  static async getAll(): Promise<AlertResponse[]> {
    await delay();
    return clone(getDb().alerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  static async getPage(params: {
    status?: AlertStatus;
    type?: AlertType;
    page?: number;
    size?: number;
    sort?: string;
    direction?: 'ASC' | 'DESC';
  }): Promise<Page<AlertResponse>> {
    await delay();
    const db = getDb();
    let items = [...db.alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    if (params.status) items = items.filter((item) => item.status === params.status);
    if (params.type) items = items.filter((item) => item.type === params.type);

    return clone(paginate(items, params.page ?? 0, params.size ?? 10));
  }

  static async getById(id: number): Promise<AlertResponse> {
    await delay();
    const alert = getDb().alerts.find((item) => item.id === id);
    if (!alert) throw new Error('Alerta no encontrada.');
    return clone(alert);
  }

  static async getByStatus(status: AlertStatus): Promise<AlertResponse[]> {
    await delay();
    return clone(getDb().alerts.filter((item) => item.status === status));
  }

  static async update(id: number, data: AlertUpdateRequest): Promise<AlertResponse> {
    await delay();
    const db = getDb();
    const alert = db.alerts.find((item) => item.id === id);
    if (!alert) throw new Error('Alerta no encontrada.');
    alert.status = data.status;
    alert.observations = data.observations ?? null;
    writeDb(db);
    return clone(alert);
  }

  static async resolve(id: number, observations?: string): Promise<AlertResponse> {
    return this.update(id, { status: 'RESUELTA', observations });
  }

  static async discard(id: number, observations?: string): Promise<AlertResponse> {
    return this.update(id, { status: 'DESCARTADA', observations });
  }
}

export class DashboardService {
  static async getSummary(): Promise<DashboardSummary> {
    await delay();
    const db = getDb();
    const activeCollars = db.collars.filter((item) => item.enabled).length;
    const offlineCollars = db.collars.filter((item) => item.signalStatus === 'SIN_SENAL' || !item.enabled).length;
    const pendingAlerts = db.alerts.filter((item) => item.status === 'PENDIENTE');
    const latestLocationTimestamp = [...db.locations].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0]?.recordedAt ?? null;

    return clone({
      totalCows: db.cows.length,
      cowsOutsideGeofence: db.cows.filter((item) => item.status === 'FUERA').length,
      totalCollars: db.collars.length,
      activeCollars,
      offlineCollars,
      pendingAlerts: pendingAlerts.length,
      pendingExitGeofenceAlerts: pendingAlerts.filter((item) => item.type === 'EXIT_GEOFENCE').length,
      pendingCollarOfflineAlerts: pendingAlerts.filter((item) => item.type === 'COLLAR_OFFLINE').length,
      latestLocationTimestamp,
    });
  }

  static async getCriticalAlerts(): Promise<AlertResponse[]> {
    await delay();
    return clone(getDb().alerts.filter((item) => item.status === 'PENDIENTE').sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10));
  }

  static async getOfflineCollars(): Promise<CollarResponse[]> {
    await delay();
    return clone(getDb().collars.filter((item) => item.signalStatus === 'SIN_SENAL' || !item.enabled));
  }

  static async getCowsOutsideGeofence(): Promise<CowResponse[]> {
    await delay();
    return clone(getDb().cows.filter((item) => item.status === 'FUERA'));
  }

  static async getRecentLocations(): Promise<LocationResponse[]> {
    await delay();
    return clone([...getDb().locations].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt)).slice(0, 10));
  }
}

export class LocationService {
  static async register(data: LocationRequest): Promise<LocationResponse> {
    await delay();
    const db = getDb();
    const cow = db.cows.find((item) => item.id === data.cowId);
    if (!cow) throw new Error('Vaca no encontrada.');

    const location: LocationResponse = {
      id: nextId(db.locations),
      cowId: cow.id,
      cowToken: cow.token,
      cowName: cow.name,
      latitude: data.latitude,
      longitude: data.longitude,
      recordedAt: data.recordedAt ?? nowIso(),
      insideGeofence: cow.status !== 'FUERA',
    };

    db.locations.unshift(location);
    writeDb(db);
    return clone(location);
  }

  static async getByCow(cowId: number, page = 0, size = 10): Promise<Page<LocationResponse>> {
    await delay();
    const items = getDb().locations
      .filter((item) => item.cowId === cowId)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

    return clone(paginate(items, page, size));
  }

  static async getByCowAndDates(cowId: number, start: string, end: string, page = 0, size = 10): Promise<Page<LocationResponse>> {
    await delay();
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const items = getDb().locations
      .filter((item) => item.cowId === cowId)
      .filter((item) => {
        const recorded = new Date(item.recordedAt).getTime();
        return recorded >= startDate && recorded <= endDate;
      })
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));

    return clone(paginate(items, page, size));
  }

  static async getLastByCow(cowId: number): Promise<LocationResponse> {
    await delay();
    const location = getDb().locations
      .filter((item) => item.cowId === cowId)
      .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))[0];

    if (!location) throw new Error('No hay ubicaciones para la vaca seleccionada.');
    return clone(location);
  }
}
