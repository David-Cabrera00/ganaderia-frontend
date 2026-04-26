# Ganadería 4.0 Frontend

Frontend del sistema **Ganadería 4.0**, una plataforma orientada al monitoreo y gestión ganadera mediante collares GPS, geocercas, ubicaciones y alertas operativas.

Este proyecto permite visualizar y administrar la información principal del sistema desde una interfaz web moderna, organizada por módulos y preparada para integrarse con el backend de Ganadería 4.0.

---

## Descripción

El frontend de Ganadería 4.0 permite gestionar de forma visual los procesos principales del sistema, como el registro de vacas, administración de collares, control de geocercas, consulta de ubicaciones y seguimiento de alertas.

Actualmente el proyecto puede ejecutarse en entorno local y está estructurado para facilitar su conexión con una API backend.

---

## Características principales

- Inicio de sesión.
- Panel principal con resumen del sistema.
- Gestión de vacas.
- Gestión de collares GPS.
- Gestión de geocercas.
- Consulta de ubicaciones.
- Gestión de alertas.
- Interfaz responsive y organizada.
- Estructura preparada para conexión con backend.

---

## Tecnologías utilizadas

- React
- TypeScript
- Vite
- React Router
- Axios
- Zustand
- Zod
- React Hook Form
- CSS / diseño modular

---

## Módulos del sistema

### 1. Autenticación

Permite el acceso al sistema mediante una pantalla de inicio de sesión.

### 2. Dashboard

Muestra un resumen general del estado del sistema, incluyendo información relevante de vacas, collares, geocercas y alertas.

### 3. Vacas

Permite visualizar y administrar la información de los animales registrados.

### 4. Collares

Permite gestionar los collares GPS asociados al monitoreo ganadero.

### 5. Geocercas

Permite administrar zonas geográficas definidas para el control del ganado.

### 6. Ubicaciones

Permite consultar registros de ubicación enviados por los collares.

### 7. Alertas

Permite visualizar eventos importantes, como salidas de geocerca o problemas operativos.

---

## Requisitos previos

Antes de ejecutar el proyecto necesitas tener instalado:

- Node.js 18 o superior
- npm
- Git

---

## Instalación y ejecución

Clonar el repositorio:

```bash
git clone https://github.com/David-Cabrera00/ganaderia-frontend.git
```

Entrar a la carpeta del proyecto:

```bash
cd ganaderia-frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto en local:

```bash
npm run dev
```

Abrir en el navegador:

```bash
http://localhost:5173
```

---

## Variables de entorno

Si el frontend se conecta a un backend, se puede configurar la URL de la API mediante un archivo `.env`.

Ejemplo:

```env
VITE_API_URL=https://ganaderia4backend.onrender.com
```

> El archivo `.env` no debe subirse al repositorio. Se recomienda subir solo un archivo `.env.example`.

---

## Credenciales de prueba

```text
Correo: admin@ganaderia.com
Contraseña: Admin12345
```

---

## Estado del proyecto

- Frontend funcional en entorno local.
- Interfaz organizada por módulos.
- Preparado para conexión con backend.
- Proyecto listo para ser versionado en GitHub.

---

## Autor

David Cabrera, Luis Diaz.