import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Radio } from 'lucide-react';
import { AuthService } from '@/api/services';
import { AppError } from '@/api/httpClient';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema, type LoginFormValues } from '@/utils/validations';
import type { SessionData } from '@/types';
import { CattleIcon } from '@/shared/components/ui/CattleIcon';
import './LoginPage.css';

const preventWhitespace = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === ' ') event.preventDefault();
};

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);

    try {
      const response = await AuthService.login({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });

      const session: SessionData = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
        token: response.token,
        expiresAt: Date.now() + (response.expiresIn ?? 86400000),
      };

      setSession(session);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(AppError.from(err).serverMessage);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />

      <div className="login-card login-card-wide">
        <div className="login-hero-panel">
          <div className="login-logo">
            <CattleIcon width={28} height={28} />
          </div>

          <div className="login-hero-copy">
            <span className="login-eyebrow">Sistema de monitoreo ganadero</span>
            <h1 className="login-title">Ganadería 4.0</h1>
            <p className="login-subtitle">
              Gestiona vacas, collares, geocercas, alertas y reportes desde una sola plataforma.
            </p>
          </div>

          <div className="login-feature-list">
            <div className="login-feature-item">
              <ShieldCheck size={16} />
              Control operativo del hato en tiempo real.
            </div>
            <div className="login-feature-item">
              <Radio size={16} />
              Seguimiento de activos y trazabilidad de ubicaciones.
            </div>
          </div>
        </div>

        <div className="login-form-panel">
          <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
            {serverError ? (
              <div className="alert-banner error" role="alert">
                <AlertCircle size={15} style={{ display: 'inline', marginRight: 6 }} />
                {serverError}
              </div>
            ) : null}

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="correo@ejemplo.com"
                {...register('email')}
                onKeyDown={preventWhitespace}
              />
              {errors.email ? (
                <span className="form-error">
                  <AlertCircle size={12} /> {errors.email.message}
                </span>
              ) : null}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>

              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                  {...register('password')}
                  onKeyDown={preventWhitespace}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  tabIndex={-1}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.password ? (
                <span className="form-error">
                  <AlertCircle size={12} /> {errors.password.message}
                </span>
              ) : null}
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="loading-spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                  Iniciando sesión...
                </>
              ) : (
                'Ingresar al panel'
              )}
            </button>
          </form>

          <div className="local-credentials credentials-grid">
            <div>
              <strong>Credenciales de acceso</strong>
              <div>
                <code>admin@ganaderia.com</code>
              </div>
              <div>
                <code>Admin12345</code>
              </div>
            </div>

            <div className="local-credentials-note">
              Usuario administrador con acceso a dashboard, gestión operativa y reportes.
            </div>
          </div>

          <p className="login-footer-note">
            Accede al panel principal para supervisar indicadores, activos y eventos del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}