import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ClipboardList,
  Eye,
  Filter,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { UserService } from '@/api/services';
import { AppError } from '@/shared/errors/AppError';
import { useAuthStore } from '@/stores/authStore';
import {
  userCreateSchema,
  type UserCreateFormValues,
} from '@/utils/validations';
import {
  sanitizeSearchInput,
  sanitizeStrictInput,
  sanitizeTextInput,
} from '@/shared/utils/sanitize';
import { formatDateTime } from '@/utils/helpers';
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';

type UserRole = 'ADMINISTRADOR' | 'SUPERVISOR' | 'OPERADOR' | 'TECNICO';
type RoleFilter = 'ALL' | UserRole;
type UserMetricTone = 'info' | 'success' | 'warning' | 'danger';

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string | null;
};

interface UserMetricItem {
  label: string;
  value: string | number;
  helper: string;
  tone: UserMetricTone;
  icon: ReactNode;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador',
  TECNICO: 'Técnico',
};

const ROLE_FILTERS: Array<{ label: string; value: RoleFilter }> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Administrador', value: 'ADMINISTRADOR' },
  { label: 'Supervisor', value: 'SUPERVISOR' },
  { label: 'Operador', value: 'OPERADOR' },
  { label: 'Técnico', value: 'TECNICO' },
];

const userMetricToneLabels: Record<UserMetricTone, string> = {
  info: 'Accesos',
  success: 'Activo',
  warning: 'Control',
  danger: 'Atención',
};

function getRoleClass(role: UserRole) {
  if (role === 'ADMINISTRADOR') return 'users-role-admin';
  if (role === 'SUPERVISOR') return 'users-role-supervisor';
  if (role === 'OPERADOR') return 'users-role-operator';
  return 'users-role-tech';
}

function getStatusClass(active: boolean) {
  return active ? 'users-status-active' : 'users-status-inactive';
}

export function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { hasAnyRole } = useAuthStore();
  const canWrite = hasAnyRole(['ADMINISTRADOR']);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'OPERADOR',
      password: '',
      active: true,
    },
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const data = await UserService.getAll();
      const safeData = Array.isArray(data) ? data : [];

      setUsers(safeData);

      if (
        selectedUserId !== null &&
        !safeData.some((item) => item.id === selectedUserId)
      ) {
        setSelectedUserId(null);
      }
    } catch (err) {
      toast.error(AppError.from(err).serverMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        ROLE_LABELS[user.role].toLowerCase().includes(q);

      const matchesRole = roleFilter === 'ALL' ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const selectedUser =
    selectedUserId !== null
      ? filtered.find((item) => item.id === selectedUserId) ??
        users.find((item) => item.id === selectedUserId) ??
        null
      : null;

  const openCreate = () => {
    reset({
      name: '',
      email: '',
      role: 'OPERADOR',
      password: '',
      active: true,
    });
    setServerError(null);
    setModalOpen(true);
  };

  const onSubmit = async (values: UserCreateFormValues) => {
    setServerError(null);

    try {
      const payload = {
        name: sanitizeTextInput(values.name, 50),
        email: values.email.replace(/\s+/g, '').toLowerCase().slice(0, 120),
        role: values.role,
        password: sanitizeStrictInput(values.password, 50),
        active: values.active,
      };

      await UserService.create(payload);
      toast.success('Usuario creado correctamente');
      setModalOpen(false);
      void loadUsers();
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((item) => item.active).length;
  const inactiveUsers = users.filter((item) => !item.active).length;
  const adminUsers = users.filter((item) => item.role === 'ADMINISTRADOR').length;
  const operationalUsers = users.filter((item) =>
    ['SUPERVISOR', 'OPERADOR', 'TECNICO'].includes(item.role),
  ).length;

  const metrics: UserMetricItem[] = [
    {
      label: 'Usuarios totales',
      value: totalUsers,
      helper: 'Perfiles registrados en el sistema.',
      tone: 'info',
      icon: <Users size={24} />,
    },
    {
      label: 'Usuarios activos',
      value: activeUsers,
      helper: 'Perfiles con acceso habilitado.',
      tone: 'success',
      icon: <UserCheck size={24} />,
    },
    {
      label: 'Administradores',
      value: adminUsers,
      helper: 'Usuarios con control total del sistema.',
      tone: 'warning',
      icon: <ShieldCheck size={24} />,
    },
    {
      label: 'Operación',
      value: operationalUsers,
      helper: 'Supervisores, operadores y técnicos.',
      tone: inactiveUsers > 0 ? 'warning' : 'info',
      icon: <UserCog size={24} />,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Gestión de acceso"
        title="Usuarios"
        badge="Control de perfiles"
        subtitle="Administra perfiles, roles y estados de acceso habilitados por el backend actual."
        actions={
          canWrite ? (
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} />
              Nuevo usuario
            </Button>
          ) : undefined
        }
      />

      <PageContainer>
        <section className="users-premium-hero card">
          <div className="users-premium-hero-copy">
            <span className="users-premium-eyebrow">
              <Sparkles size={14} />
              Administración segura
            </span>

            <h2>Gestión visual de usuarios, roles y permisos operativos</h2>

            <p>
              Controla perfiles de acceso, valida usuarios activos y consulta la
              distribución de roles sin modificar la integración con el backend.
            </p>

            <div className="users-premium-pills">
              <span>
                <Users size={14} />
                {totalUsers} usuarios
              </span>
              <span>
                <ShieldCheck size={14} />
                {adminUsers} administradores
              </span>
              <span>
                <UserCheck size={14} />
                {activeUsers} activos
              </span>
            </div>
          </div>

          <div className="users-premium-hero-card">
            <span>Usuario seleccionado</span>
            <strong>{selectedUser?.name ?? '—'}</strong>
            <small>
              {selectedUser
                ? `${ROLE_LABELS[selectedUser.role]} · ${selectedUser.email}`
                : 'Selecciona una fila para ver el detalle rápido.'}
            </small>
          </div>
        </section>

        <section className="users-premium-metrics">
          {metrics.map((metric) => (
            <article
              key={metric.label}
              className={`users-premium-metric users-premium-metric-${metric.tone}`}
            >
              <div className="users-premium-metric-top">
                <div className="users-premium-metric-icon">{metric.icon}</div>

                <span className="users-premium-metric-status">
                  <Sparkles size={13} />
                  {userMetricToneLabels[metric.tone]}
                </span>
              </div>

              <div className="users-premium-metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.helper}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="card users-premium-toolbar">
          <div className="users-premium-toolbar-main">
            <div className="users-premium-toolbar-title">
              <Search size={18} />

              <div>
                <strong>Búsqueda de perfiles</strong>
                <span>Filtra por nombre, correo o rol del usuario.</span>
              </div>
            </div>

            <div className="users-premium-search-box">
              <Search size={15} className="search-icon" />
              <input
                className="search-input users-premium-search"
                placeholder="Buscar por nombre, correo o rol..."
                value={search}
                maxLength={60}
                onChange={(e) =>
                  setSearch(sanitizeSearchInput(e.target.value, 60))
                }
              />
            </div>
          </div>

          <div className="users-premium-toolbar-note">
            Mostrando {filtered.length} de {users.length} perfiles registrados
          </div>
        </section>

        <section className="card users-premium-filters-panel">
          <div className="card-header users-premium-section-header">
            <div>
              <span className="card-title">
                <Filter size={16} />
                Filtros rápidos
              </span>
              <p className="users-premium-section-subtitle">
                Cambia la vista según el rol asignado.
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="users-premium-filter-chips">
              {ROLE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`users-premium-filter-chip ${
                    roleFilter === item.value ? 'active' : ''
                  }`}
                  onClick={() => setRoleFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {selectedUser ? (
          <section className="card users-premium-detail-panel">
            <div className="card-header users-premium-section-header">
              <div>
                <span className="card-title">
                  <Eye size={16} />
                  Detalle rápido
                </span>
                <p className="users-premium-section-subtitle">
                  Resumen del perfil seleccionado.
                </p>
              </div>

              <div className="users-premium-detail-badges">
                <span className={`users-role-chip ${getRoleClass(selectedUser.role)}`}>
                  {ROLE_LABELS[selectedUser.role]}
                </span>

                <span
                  className={`users-status-chip ${getStatusClass(
                    selectedUser.active,
                  )}`}
                >
                  {selectedUser.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="users-premium-detail-grid">
                <div className="users-premium-detail-item">
                  <span>Nombre</span>
                  <strong>{selectedUser.name}</strong>
                </div>

                <div className="users-premium-detail-item">
                  <span>Correo</span>
                  <strong>{selectedUser.email}</strong>
                </div>

                <div className="users-premium-detail-item">
                  <span>Rol</span>
                  <strong>{ROLE_LABELS[selectedUser.role]}</strong>
                </div>

                <div className="users-premium-detail-item">
                  <span>Estado</span>
                  <strong>{selectedUser.active ? 'Activo' : 'Inactivo'}</strong>
                </div>

                <div className="users-premium-detail-item">
                  <span>Creación</span>
                  <strong>
                    {selectedUser.createdAt
                      ? formatDateTime(selectedUser.createdAt)
                      : 'Sin dato'}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <section className="card users-premium-table-panel">
            <div className="card-header users-premium-section-header">
              <div>
                <span className="card-title">
                  <ClipboardList size={16} />
                  Directorio de usuarios
                </span>
                <p className="users-premium-section-subtitle">
                  Listado de perfiles, roles y estado actual de acceso.
                </p>
              </div>

              <span className="users-premium-table-badge">
                {filtered.length} registros
              </span>
            </div>

            <div className="card-body">
              <div className="users-premium-table-shell">
                <table>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <div className="empty-state">
                            <Users size={32} className="empty-state-icon" />
                            <span className="empty-state-text">
                              No se encontraron usuarios con el filtro actual.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user) => (
                        <tr
                          key={user.id}
                          className={
                            selectedUserId === user.id ? 'users-row-selected' : ''
                          }
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <td>
                            <div className="users-name-cell">
                              <div className="users-name-avatar">
                                {user.name.charAt(0).toUpperCase()}
                              </div>

                              <strong>{user.name}</strong>
                            </div>
                          </td>

                          <td>
                            <span className="users-email-chip">
                              <Mail size={13} />
                              {user.email}
                            </span>
                          </td>

                          <td>
                            <span className={`users-role-chip ${getRoleClass(user.role)}`}>
                              {ROLE_LABELS[user.role]}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`users-status-chip ${getStatusClass(
                                user.active,
                              )}`}
                            >
                              {user.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </PageContainer>

      {modalOpen ? (
        <div
          className="modal-backdrop users-premium-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal users-premium-modal">
            <div className="modal-header">
              <span className="modal-title">Registrar usuario</span>

              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={() => setModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="modal-body">
                <div className="users-premium-modal-summary">
                  <div className="users-premium-modal-icon">
                    <UserCog size={22} />
                  </div>

                  <div>
                    <strong>Nuevo perfil de acceso</strong>
                    <span>
                      Define nombre, correo, rol y estado inicial del usuario.
                    </span>
                  </div>
                </div>

                {serverError ? (
                  <div className="alert-banner error" style={{ marginBottom: 16 }}>
                    <AlertCircle
                      size={14}
                      style={{ display: 'inline', marginRight: 6 }}
                    />
                    {serverError}
                  </div>
                ) : null}

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nombre *</label>
                    <input
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Nombre completo"
                      maxLength={50}
                      {...register('name', {
                        setValueAs: (value) =>
                          sanitizeTextInput(value ?? '', 50),
                      })}
                    />

                    {errors.name ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.name.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Correo *</label>
                    <input
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="correo@ejemplo.com"
                      maxLength={120}
                      {...register('email', {
                        setValueAs: (value) =>
                          String(value ?? '')
                            .replace(/\s+/g, '')
                            .toLowerCase()
                            .slice(0, 120),
                      })}
                      onKeyDown={(e) => {
                        if (e.key === ' ') e.preventDefault();
                      }}
                    />

                    {errors.email ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.email.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Rol *</label>
                    <select
                      className={`form-select ${errors.role ? 'error' : ''}`}
                      {...register('role')}
                    >
                      <option value="ADMINISTRADOR">Administrador</option>
                      <option value="SUPERVISOR">Supervisor</option>
                      <option value="OPERADOR">Operador</option>
                      <option value="TECNICO">Técnico</option>
                    </select>

                    {errors.role ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.role.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contraseña *</label>
                    <input
                      type="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Mínimo 8 caracteres"
                      maxLength={50}
                      {...register('password', {
                        setValueAs: (value) =>
                          sanitizeStrictInput(value ?? '', 50),
                      })}
                      onKeyDown={(e) => {
                        if (e.key === ' ') e.preventDefault();
                      }}
                    />

                    {errors.password ? (
                      <span className="form-error">
                        <AlertCircle size={11} />
                        {errors.password.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group" style={{ alignSelf: 'end' }}>
                    <label className="users-premium-checkbox">
                      <input type="checkbox" {...register('active')} />
                      <span>Usuario activo</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="loading-spinner"
                        style={{ width: 14, height: 14, borderWidth: 2 }}
                      />
                      Guardando...
                    </>
                  ) : (
                    'Crear usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}