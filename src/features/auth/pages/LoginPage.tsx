import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuthStore } from "../../../app/store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setMessage("Debes completar correo y contraseña.");
      return;
    }

    if (/\s/.test(normalizedEmail)) {
      setMessage("El correo no puede contener espacios.");
      return;
    }

    if (/\s/.test(password)) {
      setMessage("La contraseña no puede contener espacios.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const data = await login({
        email: normalizedEmail,
        password,
      });

      setSession(data.token, data.user);
      navigate("/", { replace: true });
    } catch {
      setMessage("No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Iniciar sesión</h1>

      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;