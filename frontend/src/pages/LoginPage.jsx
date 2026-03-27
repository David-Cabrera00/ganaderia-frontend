import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCow, FaUser, FaLock } from "react-icons/fa6";
import api from "../services/api";

export default function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await api.post("/auth/login", {
                email: formData.email,
                password: formData.password
            });

            localStorage.setItem("user", JSON.stringify(response.data));
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "No se pudo iniciar sesión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh" }} className="d-flex">
            <div
                className="d-flex flex-column justify-content-center align-items-center p-5"
                style={{
                    width: "45%",
                    background: "#0f172a",
                    color: "white"
                }}
            >
                <div style={{ width: "100%", maxWidth: "380px" }}>
                    <div className="text-center mb-4">
                        <FaCow size={45} color="#22c55e" />
                        <h2 className="fw-bold mt-3">Ganadería 4.0</h2>
                        <p style={{ color: "#94a3b8" }}>
                            Sistema inteligente de monitoreo ganadero
                        </p>
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label">Correo</label>
                            <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Ingrese su correo"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Contraseña</label>
                            <div className="input-group">
                <span className="input-group-text">
                  <FaLock />
                </span>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Ingrese su contraseña"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button className="btn btn-success w-100 fw-bold" disabled={loading}>
                            {loading ? "Ingresando..." : "Ingresar al sistema"}
                        </button>
                    </form>

                    <p className="text-center mt-4" style={{ color: "#64748b" }}>
                        Plataforma de monitoreo inteligente para gestión ganadera
                    </p>
                </div>
            </div>

            <div
                style={{
                    width: "55%",
                    backgroundImage: "url('/login-ganado.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative"
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)"
                    }}
                />

                <div
                    className="d-flex flex-column justify-content-center align-items-center text-white"
                    style={{
                        position: "relative",
                        height: "100%",
                        textAlign: "center",
                        padding: "40px"
                    }}
                >
                    <h1 className="fw-bold">Ganadería Inteligente</h1>
                    <p style={{ maxWidth: "450px", fontSize: "18px" }}>
                        Monitoreo en tiempo real del ganado mediante collares GPS,
                        análisis inteligente y control de perímetros.
                    </p>
                </div>
            </div>
        </div>
    );
}