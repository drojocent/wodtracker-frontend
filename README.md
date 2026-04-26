
# WODTracker Frontend

SPA Vue 3 para la plataforma de seguimiento de entrenamientos CrossFit. Interfaz responsiva para registro de WODs, benchmarks y récords personales.

## Características

- Autenticación con JWT
- Gestión de perfil de usuario
- Crear y ejecutar entrenamientos (WODs)
- Timer integrado para entrenamientos
- Seguimiento de benchmarks
- Registro de récords personales
- Propuestas de WODs
- Panel administrativo

## Stack

- Vue 3.5.13
- Vite 6.2.0
- Vue Router 4.5.0
- Pinia 3.0.2
- Axios 1.9.0
- Vitest 3.2.4

## Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- User Service en http://localhost:8080
- WOD Service en http://localhost:8081

## Instalación

Desarrollo local:

```bash
npm install
npm run dev
```

Accesible en http://localhost:5173

## Scripts

```bash
npm run dev         # Servidor de desarrollo con hot reload
npm run build       # Build de producción
npm run preview     # Preview del build
npm test            # Tests en modo watch
npm test:run        # Ejecutar tests una sola vez
npm test:coverage   # Cobertura de tests
```

## Estructura

```
src/
├── assets/       # Estilos y recursos
├── components/   # Componentes reutilizables
├── layouts/      # Layouts de página
├── views/        # Páginas/Vistas
├── router/       # Configuración de rutas
├── stores/       # Estado Pinia
├── services/     # Clientes API
├── utils/        # Funciones utilitarias
├── App.vue       # Componente raíz
└── main.js       # Punto de entrada
```

## Rutas principales

Públicas:
- `/login` - Inicio de sesión
- `/register` - Registro de usuario

Autenticadas:
- `/` - Dashboard
- `/profile` - Perfil de usuario
- `/timer` - Timer para entrenamientos
- `/benchmarks` - Lista de benchmarks
- `/prs` - Récords personales
- `/proposal` - Proponer WOD

Admin:
- `/admin/wods` - Gestión de WODs
- `/admin/proposals` - Revisar propuestas
- `/admin/users` - Gestión de usuarios

## Testing

```bash
npm test:run
```

Tests de componentes en `src/components/__tests__/`, vistas en `src/views/__tests__/`.

## Despliegue

Build de producción:

```bash
npm run build
```

Genera carpeta `dist/` lista para servir.

Con Docker:

```bash
docker build -t wodtracker-frontend .
docker run -p 3000:80 wodtracker-frontend
```

## APIs Backend

- User Service: http://localhost:8080 (autenticación, perfiles, usuarios)
- WOD Service: http://localhost:8081 (WODs, benchmarks, resultados, PRs)

Documentación Swagger en `/swagger-ui.html` de cada servicio.



