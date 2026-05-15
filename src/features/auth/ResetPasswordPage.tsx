import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

import { AuthService } from "@/api/services";
import { AppError } from "@/api/httpClient";
import { CattleIcon } from "@/shared/components/ui/CattleIcon";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/utils/validations";

import "./LoginPage.css";

const preventWhitespace = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === " ") event.preventDefault();
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="login-page login-page-fixed-theme">
        <div className="login-bg" />

        <div className="login-card login-card-wide">
          <div className="login-hero-panel">
            <div className="login-logo">
              <CattleIcon width={28} height={28} />
            </div>

            <div className="login-hero-copy">
              <span className="login-eyebrow">
                Sistema de monitoreo ganadero
              </span>

              <h1 className="login-title">Ganadería 4.0</h1>

              <p className="login-subtitle">
                Gestiona vacas, collares, geocercas, alertas y reportes desde
                una sola plataforma.
              </p>
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
            <div className="login-error-state">
              <div className="login-error-icon">⚠</div>
              <span className="login-error-title">Enlace no válido</span>
              <p className="login-error-message">
                El enlace de recuperación no es válido o ha expirado. Solicita
                un nuevo enlace desde la pantalla de login.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/login")}
              >
                Volver a login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);

    try {
      await AuthService.resetPassword({
        token,
        newPassword: values.newPassword,
      });

      setResetSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      const appError = AppError.from(err);
      appError.serverMessage =
        appError.serverMessage ||
        "No pudimos restablecer la contraseña. Solicita un nuevo enlace e inténtalo otra vez.";
      setServerError(appError.serverMessage);
    }
  };

  if (resetSuccess) {
    return (
      <div className="login-page login-page-fixed-theme">
        <div className="login-bg" />

        <div className="login-card login-card-wide">
          <div className="login-hero-panel">
            <div className="login-logo">
              <CattleIcon width={28} height={28} />
            </div>

            <div className="login-hero-copy">
              <span className="login-eyebrow">
                Sistema de monitoreo ganadero
              </span>

              <h1 className="login-title">Ganadería 4.0</h1>

              <p className="login-subtitle">
                Gestiona vacas, collares, geocercas, alertas y reportes desde
                una sola plataforma.
              </p>
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
            <div className="login-success-state">
              <div className="login-success-icon">✓</div>
              <span className="login-success-title">
                Contraseña actualizada
              </span>
              <p className="login-success-message">
                Tu contraseña se ha restablecido correctamente. Serás redirigido
                al login.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="reset-password-header">
              <span className="reset-password-eyebrow">Restablecer acceso</span>
              <h2 className="reset-password-title">Nueva contraseña</h2>
              <p className="reset-password-subtitle">
                Ingresa una nueva contraseña segura para tu cuenta.
              </p>
            </div>

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
              <label className="form-label" htmlFor="new-password">
                Nueva contraseña
              </label>

              <div className="password-wrapper">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-input ${errors.newPassword ? "error" : ""}`}
                  placeholder="••••••••"
                  {...register("newPassword")}
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

              {errors.newPassword ? (
                <span className="form-error">
                  <AlertCircle size={12} />
                  {errors.newPassword.message}
                </span>
              ) : null}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">
                Confirmar contraseña
              </label>

              <div className="password-wrapper">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  onKeyDown={preventWhitespace}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {errors.confirmPassword ? (
                <span className="form-error">
                  <AlertCircle size={12} />
                  {errors.confirmPassword.message}
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
                  Restableciendo...
                </>
              ) : (
                "Restablecer contraseña"
              )}
            </button>
          </form>

          <div className="reset-password-footer">
            <p>
              ¿Ya recuerdas tu contraseña?{" "}
              <button
                type="button"
                className="login-forgot-password"
                onClick={() => navigate("/login")}
              >
                Volver a login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
