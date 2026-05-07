# Ajuste para backend real

Este frontend quedó preparado para consumir el backend Spring Boot del proyecto `ganaderia-backend-main`.

## Lo que ya quedó conectado al backend
- Login (`POST /api/auth/login`)
- Perfil actual (`GET /api/auth/me`)
- Vacas (`/api/cows`)
- Collares (`/api/collars`)
- Geocercas (`/api/geofences`)
- Alertas (`/api/alerts`)
- Dashboard (`/api/dashboard/*`)
- Ubicaciones (`/api/locations/*`)

## Lo que quedó local temporalmente
- Usuarios (`UserService`) sigue local/mock en frontend.

### Motivo
En el backend público incluido en el zip sí existen:
- `POST /api/users`
- `GET /api/users`

pero no aparecen endpoints para:
- actualizar usuario
- activar/desactivar usuario

Como el módulo del frontend sí usa esas acciones, se dejó local para no romper el flujo actual.

## Variable de entorno
La app usa:

```env
VITE_API_URL=https://ganaderia4backend.onrender.com
```

## Antes de probar
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Levanta la app:
   ```bash
   npm run dev
   ```
3. Verifica que el backend esté despierto/respondiendo.

## Nota
Si luego agregas en backend los endpoints de edición/activación de usuarios, se puede migrar `UserService` a backend real sin tocar el diseño.
