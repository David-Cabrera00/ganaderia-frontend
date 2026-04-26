# Ganadería 4.0 — Frontend

Plataforma de monitoreo ganadero. Frontend construido con React + TypeScript + Vite.

> Esta versión quedó preparada para trabajar **100% en local** con datos simulados en `localStorage`, con dashboard rediseñado y estructura modular lista para conectar backend real después.

---

## Stack

| Tecnología | Uso |
|---|---|
| React 18 | UI |
| TypeScript 5 | Tipado fuerte |
| Vite 5 | Bundler y dev server |
| React Router 6 | Navegación + rutas protegidas |
| Zustand + persist | Estado global y persistencia de sesión |
| React Hook Form | Formularios |
| Zod | Validación de esquemas |
| Axios | HTTP client con interceptores JWT |
| react-hot-toast | Notificaciones |
| lucide-react | Iconos |

---

## Requisitos previos

- Node.js 18+ 
- Node.js 18+
- No necesitas backend para esta versión local

---

## Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno (opcional)
cp .env.example .env

# 3. Arrancar el servidor de desarrollo
npm run dev
```

El frontend corre en **http://localhost:5173**

Esta versión usa datos simulados guardados en `localStorage`.

Credenciales de prueba:
- `admin@ganaderia.com`
- `Admin12345`

---

## Variables de entorno

Crea un archivo `.env` en la raíz:

```env
VITE_APP_MODE=local
# Cuando llegue el momento de conectar backend real:
# VITE_API_URL=http://localhost:8080/api
```

Si el backend está en otro host (ej. producción):
```env
VITE_API_URL=https://tu-backend.com/api
```

---

## Estructura de carpetas

```
src/
├── api/
│   ├── httpClient.ts     # Axios + interceptores JWT + AppError
│   └── services.ts       # Servicios por dominio (AuthService, CowService, etc.)
│
├── components/
│   ├── guards/
│   │   ├── AuthGuard.tsx   # Protege rutas privadas
│   │   ├── GuestGuard.tsx  # Protege rutas públicas (login)
│   │   └── RoleGuard.tsx   # Control por rol
│   └── layout/
│       ├── AppLayout.tsx   # Contenedor principal con sidebar
│       ├── Sidebar.tsx     # Navegación lateral
│       └── Sidebar.css
│
├── features/              # Módulos por funcionalidad
│   ├── auth/              # Login
│   ├── dashboard/         # Panel principal
│   ├── cows/              # Gestión de vacas
│   ├── collars/           # Gestión de collares
│   ├── geofences/         # Geocercas
│   ├── alerts/            # Alertas con paginación
│   ├── users/             # Usuarios (solo ADMINISTRADOR)
│   └── locations/         # Historial GPS
│
├── router/
│   └── index.tsx          # Definición de rutas
│
├── stores/
│   └── authStore.ts       # Zustand store con persistencia en localStorage
│
├── styles/
│   └── globals.css        # Sistema de diseño completo
│
├── types/
│   └── index.ts           # Todos los tipos TypeScript (alineados con backend)
│
└── utils/
    ├── helpers.ts          # Labels de enums, formatters de fecha
    └── validations.ts      # Esquemas Zod para todos los formularios
```

---

## Seguridad y autenticación

### Problema del botón "Atrás" — RESUELTO
Después de hacer login, `navigate('/dashboard', { replace: true })` reemplaza la entrada `/login`
en el historial del navegador. El botón "atrás" NO puede regresar al login.

Además, `GuestGuard` protege `/login`: si el usuario ya tiene sesión válida,
es redirigido automáticamente al dashboard.

### Persistencia de sesión
La sesión (token JWT + datos del usuario) se guarda en `localStorage` via Zustand persist.
Al recargar la página, la sesión se restaura automáticamente si no ha expirado.

### Expiración de token
`isSessionValid()` verifica el campo `expiresAt` (calculado como `Date.now() + expiresIn`).
Si el token expiró, el guard limpia la sesión y redirige al login.

### Interceptor 401
Si el backend devuelve 401 en cualquier petición, el interceptor de Axios limpia la sesión
y redirige al login automáticamente.

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| ADMINISTRADOR | Todo el sistema |
| SUPERVISOR | Dashboard, Vacas, Collares, Geocercas, Alertas, Ubicaciones |
| OPERADOR | Dashboard, Vacas, Collares, Alertas, Ubicaciones |
| TECNICO | Dashboard, Collares (CRUD), Alertas, Ubicaciones |

Los menús del sidebar se filtran automáticamente según el rol del usuario.

---

## Validaciones implementadas

- ✅ Email sin espacios (onKeyDown + Zod)
- ✅ Contraseña sin espacios (onKeyDown + Zod)
- ✅ Contraseña mínimo 8 caracteres
- ✅ Token de vaca/collar sin espacios
- ✅ Campos obligatorios
- ✅ Longitudes máximas alineadas con backend
- ✅ Números solo numéricos (type="number" + Zod)
- ✅ Coordenadas geográficas en rango válido
- ✅ Mensajes de error del backend mostrados en el formulario

---

## Estado actual

- Estructura modular fortalecida con `shared`, `layouts`, `features` y wrappers reutilizables.
- Dashboard rediseñado con enfoque de monitoreo ganadero, foco operativo, radar de salud y accesos rápidos.
- Sidebar, topbar y login ajustados para sentirse más coherentes con Ganadería 4.0.
- Proyecto listo para seguir en local sin depender todavía del backend real.
- Base preparada para la siguiente fase: conexión backend, validación final y despliegue.

---

## Build para producción

```bash
npm run build
```

Los archivos quedan en `/dist`. Sirve con cualquier servidor estático (Nginx, Apache, etc.).

Para Nginx, agrega esto para que React Router funcione:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
