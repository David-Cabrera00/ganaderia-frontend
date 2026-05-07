# Ganadería 4.0 — Frontend

Plataforma de monitoreo ganadero. Frontend construido con React + TypeScript + Vite.

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

```
