import { useState } from "react";
import type { KeyboardEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Radio, ShieldCheck, X } from "lucide-react";

import { AuthService } from "@/api/services";
import { AppError } from "@/api/httpClient";
import { useAuthStore } from "@/stores/authStore";
import { CattleIcon } from "@/shared/components/ui/CattleIcon";
import {
  loginSchema,
  type LoginFormValues,
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/utils/validations";
import type { SessionData } from "@/types";

import "./LoginPage.css";

const preventWhitespace = (event: KeyboardEvent<HTMLInputElement>) => {
  if (event.key === " ") event.preventDefault();
};

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: errorsForgot, isSubmitting: isSubmittingForgot },
    reset: resetForgot,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
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

  const onForgotPasswordSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await AuthService.requestPasswordReset(values.email.trim().toLowerCase());
      setForgotPasswordSuccess(true);
      resetForgot();
      setTimeout(() => {
        setForgotPasswordModalOpen(false);
        setForgotPasswordSuccess(false);
      }, 2500);
    } catch (err) {
      const appError = AppError.from(err);
      if (appError.status === 429) {
        appError.serverMessage =
          "Has realizado demasiadas solicitudes. Intenta nuevamente más tarde.";
      } else if (
        !appError.serverMessage ||
        (appError.status && appError.status >= 500)
      ) {
        appError.serverMessage =
          "No pudimos procesar la solicitud. Inténtalo nuevamente.";
      }
      setServerError(appError.serverMessage);
    }
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordModalOpen(false);
    setForgotPasswordSuccess(false);
    setServerError(null);
    resetForgot();
  };

  return (
    <div className="login-page login-page-fixed-theme">
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
              Gestiona vacas, collares, geocercas, alertas y reportes desde una
              sola plataforma.
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

          <div className="login-authors-footer">
            <span>Desarrollado por</span>

            <p>
              Jorge Alejandro Parra
              <strong>·</strong>
              Luis Sebastian Diaz
              <strong>·</strong>
              David Andres Cabrera
            </p>
          </div>
        </div>

        <div className="login-form-panel">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="login-form"
            noValidate
          >
            {serverError ? (
              <div className="alert-banner error" role="alert">
                <AlertCircle
                  size={15}
                  style={{ display: "inline", marginRight: 6 }}
                />
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
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="correo@ejemplo.com"
                {...register("email")}
                onKeyDown={preventWhitespace}
              />

              {errors.email ? (
                <span className="form-error">
                  <AlertCircle size={12} />
                  {errors.email.message}
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="••••••••"
                  {...register("password")}
                  onKeyDown={preventWhitespace}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  tabIndex={-1}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {errors.password ? (
                <span className="form-error">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </span>
              ) : null}

              <button
                type="button"
                className="login-forgot-password"
                onClick={() => setForgotPasswordModalOpen(true)}
              >
                ¿Olvidaste tu contraseña?
              </button>
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
                "Ingresar al panel"
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
                <code>123ganadero456*</code>
              </div>
            </div>

            <div className="local-credentials-note">
              Usuario administrador con acceso a dashboard, gestión operativa y
              reportes.
            </div>
          </div>

          <p className="login-footer-note">
            Accede al panel principal para supervisar indicadores, activos y
            eventos del sistema.
          </p>
        </div>
      </div>

      {forgotPasswordModalOpen ? (
        <div
          className="login-modal-backdrop"
          onClick={closeForgotPasswordModal}
        >
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <span className="login-modal-title">Recuperar contraseña</span>
              <button
                type="button"
                className="login-modal-close"
                onClick={closeForgotPasswordModal}
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {forgotPasswordSuccess ? (
              <div className="login-modal-body login-modal-success">
                <div className="login-modal-success-icon">✓</div>
                <span className="login-modal-success-title">
                  Solicitud enviada
                </span>
                <p className="login-modal-success-message">
                  Si el correo está registrado, recibirás un enlace para
                  restablecer tu contraseña.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitForgot(onForgotPasswordSubmit)}
                noValidate
              >
                <div className="login-modal-body">
                  {serverError ? (
                    <div className="alert-banner error" role="alert">
                      <AlertCircle size={14} />
                      {serverError}
                    </div>
                  ) : null}

                  <div className="form-group">
                    <label className="form-label" htmlFor="forgot-email">
                      Correo electrónico
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      className={`form-input ${errorsForgot.email ? "error" : ""}`}
                      placeholder="correo@ejemplo.com"
                      {...registerForgot("email")}
                      onKeyDown={preventWhitespace}
                    />
                    {errorsForgot.email ? (
                      <span className="form-error">
                        <AlertCircle size={12} />
                        {errorsForgot.email.message}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="login-modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeForgotPasswordModal}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmittingForgot}
                  >
                    {isSubmittingForgot ? (
                      <>
                        <span
                          className="loading-spinner"
                          style={{ width: 14, height: 14, borderWidth: 2 }}
                        />
                        Enviando...
                      </>
                    ) : (
                      "Enviar enlace"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
