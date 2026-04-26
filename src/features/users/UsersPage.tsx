import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Filter,
  Mail,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
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
import { PageContainer } from '@/layouts/components/PageContainer';
import { PageHeader } from '@/layouts/components/PageHeader';
import { Button } from '@/shared/components/ui/Button';
import { MetricCard } from '@/shared/components/ui/MetricCard';
import toast from 'react-hot-toast';

type UserRole = 'ADMINISTRADOR' | 'SUPERVISOR' | 'OPERADOR' | 'TECNICO';
type RoleFilter = 'ALL' | UserRole;

type UserItem = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt?: string | null;
};

const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRADOR: 'Administrador',
  SUPERVISOR: 'Supervisor',
  OPERADOR: 'Operador',
  TECNICO: 'Técnico',
};

const ROLE_BADGES: Record<UserRole, string> = {
  ADMINISTRADOR: 'badge-red',
  SUPERVISOR: 'badge-blue',
  OPERADOR: 'badge-green',
  TECNICO: 'badge-yellow',
};

export function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
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
      setUsers(Array.isArray(data) ? data : []);

      if (selectedUserId !== null && !data.some((item) => item.id === selectedUserId)) {
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
  const safeUsers = Array.isArray(users) ? users : [];

  return safeUsers.filter((user) => {
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
    setEditing(null);
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

  const openEdit = (user: UserItem) => {
    setEditing(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
      active: user.active,
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

      if (editing) {
        await UserService.update(editing.id, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        await UserService.create(payload);
        toast.success('Usuario creado correctamente');
      }

      setModalOpen(false);
      void loadUsers();
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  const handleToggleActive = async (user: UserItem) => {
  try {
    await UserService.toggleActive(user.id);
    toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
    void loadUsers();
  } catch (err) {
    toast.error(AppError.from(err).serverMessage);
  }
};

  const totalUsers = users.length;
  const activeUsers = users.filter((item) => item.active).length;
  const adminUsers = users.filter((item) => item.role === 'ADMINISTRADOR').length;
  const operationalUsers = users.filter((item) =>
    ['SUPERVISOR', 'OPERADOR', 'TECNICO'].includes(item.role),
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Gestión de acceso"
        title="Usuarios"
        badge="Control de perfiles"
        subtitle="Administra perfiles, roles y estado operativo de acceso al sistema."
        actions={
          canWrite ? (
            <Button size="sm" onClick={openCreate}>
              <Plus size={15} /> Nuevo usuario
            </Button>
          ) : undefined
        }
      />

      <PageContainer>
        <section className="overview-grid">
          <MetricCard
            icon={<Users size={20} />}
            label="Usuarios totales"
            value={totalUsers}
            helper="Perfiles registrados en el sistema"
            tone="info"
          />
          <MetricCard
            icon={<ShieldCheck size={20} />}
            label="Usuarios activos"
            value={activeUsers}
            helper="Perfiles con acceso habilitado"
            tone="success"
          />
          <MetricCard
            icon={<AlertCircle size={20} />}
            label="Administradores"
            value={adminUsers}
            helper="Usuarios con control total"
            tone="warning"
          />
          <MetricCard
            icon={<Mail size={20} />}
            label="Operación"
            value={operationalUsers}
            helper="Supervisores, operadores y técnicos"
            tone="default"
          />
        </section>

        <div className="toolbar toolbar-panel">
          <div className="toolbar-left">
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                className="search-input"
                placeholder="Buscar por nombre, correo o rol..."
                value={search}
                maxLength={60}
                onChange={(e) => setSearch(sanitizeSearchInput(e.target.value, 60))}
              />
            </div>
          </div>

          <span className="page-summary-note">
            Mostrando {filtered.length} de {users.length} registros
          </span>
        </div>

        <section
          className="card"
          style={{
            marginTop: 16,
          }}
        >
          <div className="card-header">
            <span className="card-title">
              <Filter size={16} />
              Filtros rápidos
            </span>
          </div>

          <div
            className="card-body"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            {[
              { label: 'Todos', value: 'ALL' as const },
              { label: 'Administrador', value: 'ADMINISTRADOR' as const },
              { label: 'Supervisor', value: 'SUPERVISOR' as const },
              { label: 'Operador', value: 'OPERADOR' as const },
              { label: 'Técnico', value: 'TECNICO' as const },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className="btn btn-secondary btn-sm"
                style={
                  roleFilter === item.value
                    ? {
                        background: 'var(--accent-dim)',
                        borderColor: 'var(--accent)',
                        color: 'var(--accent)',
                      }
                    : undefined
                }
                onClick={() => setRoleFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {selectedUser ? (
          <section
            className="card"
            style={{
              marginTop: 16,
            }}
          >
            <div className="card-header">
              <span className="card-title">Detalle rápido</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${ROLE_BADGES[selectedUser.role]}`}>
                  {ROLE_LABELS[selectedUser.role]}
                </span>
                <span className={`badge ${selectedUser.active ? 'badge-green' : 'badge-gray'}`}>
                  {selectedUser.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div
              className="card-body"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 16,
              }}
            >
              <div>
                <div className="report-summary-label">Nombre</div>
                <strong>{selectedUser.name}</strong>
              </div>
              <div>
                <div className="report-summary-label">Correo</div>
                <strong>{selectedUser.email}</strong>
              </div>
              <div>
                <div className="report-summary-label">Rol</div>
                <strong>{ROLE_LABELS[selectedUser.role]}</strong>
              </div>
              <div>
                <div className="report-summary-label">Estado</div>
                <strong>{selectedUser.active ? 'Activo' : 'Inactivo'}</strong>
              </div>
            </div>
          </section>
        ) : null}

        {loading ? (
          <div className="loading-center">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  {canWrite ? <th style={{ width: 110 }}>Acciones</th> : null}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={canWrite ? 5 : 4}>
                      <div className="empty-state">
                        <Users size={32} className="empty-state-icon" />
                        <span className="empty-state-text">
                          No se encontraron usuarios con el filtro actual
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      style={{
                        cursor: 'pointer',
                        background:
                          selectedUserId === user.id ? 'var(--accent-dim)' : undefined,
                      }}
                    >
                      <td style={{ fontWeight: 500 }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${ROLE_BADGES[user.role]}`}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${user.active ? 'badge-green' : 'badge-gray'}`}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {canWrite ? (
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(user);
                              }}
                              title="Editar usuario"
                            >
                              <Pencil size={13} />
                            </button>

                            <button
                              className={`btn btn-icon btn-sm ${
                                user.active ? 'btn-danger' : 'btn-success'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleToggleActive(user);
                              }}
                              title={user.active ? 'Desactivar' : 'Activar'}
                            >
                              {user.active ? <PowerOff size={13} /> : <Power size={13} />}
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageContainer>

      {modalOpen ? (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">
                {editing ? 'Editar usuario' : 'Registrar usuario'}
              </span>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="modal-body">
                {serverError ? (
                  <div className="alert-banner error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
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
                        setValueAs: (value) => sanitizeTextInput(value ?? '', 50),
                      })}
                    />
                    {errors.name ? (
                      <span className="form-error">
                        <AlertCircle size={11} /> {errors.name.message}
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
                        <AlertCircle size={11} /> {errors.email.message}
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
                        <AlertCircle size={11} /> {errors.role.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {editing ? 'Nueva contraseña *' : 'Contraseña *'}
                    </label>
                    <input
                      type="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Mínimo 8 caracteres"
                      maxLength={50}
                      {...register('password', {
                        setValueAs: (value) => sanitizeStrictInput(value ?? '', 50),
                      })}
                      onKeyDown={(e) => {
                        if (e.key === ' ') e.preventDefault();
                      }}
                    />
                    {errors.password ? (
                      <span className="form-error">
                        <AlertCircle size={11} /> {errors.password.message}
                      </span>
                    ) : null}
                  </div>

                  <div className="form-group" style={{ alignSelf: 'end' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        {...register('active')}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: 'var(--accent)',
                        }}
                      />
                      <span className="form-label" style={{ margin: 0 }}>
                        Usuario activo
                      </span>
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
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span
                        className="loading-spinner"
                        style={{ width: 14, height: 14, borderWidth: 2 }}
                      />{' '}
                      Guardando...
                    </>
                  ) : editing ? (
                    'Guardar cambios'
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
