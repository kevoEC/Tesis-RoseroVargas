Proyecto exportado desde DevOps donde se realizo todo el proceso de CI/CD

<img width="1890" height="793" alt="image" src="https://github.com/user-attachments/assets/a546d5b8-6fe0-4220-a24c-807e61c8bf39" />
 
# Proyecto Frontend React 19

## 1. Introducción

Este proyecto es una aplicación **frontend** construida con **React 19**, utilizando **Vite** como bundler, **TailwindCSS** para estilos y una **arquitectura modular** enfocada en escalabilidad, reutilización de componentes y consumo eficiente de servicios backend.

## 2. Requisitos Previos

- Node.js 18 o superior  
- npm 9+  
- Acceso a la API/backend correspondiente  
- (Opcional) Yarn o pnpm  

## 3. Instalación y Ejecución

```bash
# Instala las dependencias
npm install

# Inicia la app en modo desarrollo
npm run dev

# Compila el proyecto para producción
npm run build

# Previsualiza el build localmente
npm run preview

# Ejecuta linter
npm run lint
```
## Estructura del Proyecto

src/
├── assets/           # Recursos gráficos, imágenes, SVG
├── components/       # Componentes UI y funcionales (reutilizables)
│   ├── dashboard/
│   ├── prospectos/
│   ├── shared/
│   ├── solicitud/
│   └── ui/
├── contexts/         # Contextos de React (Auth, UI, Catálogos, Data)
├── data/             # Datos mock o temporales
├── hooks/            # Hooks personalizados
├── layout/           # Layout principal (ej: DashboardLayout.jsx)
├── lib/              # API base y utilidades generales
├── pages/            # Vistas agrupadas por dominio
│   ├── Auth/
│   ├── Catalogo/
│   ├── Entidad/
│   ├── Legal/
│   └── Panel/
├── routes/           # Definición de rutas y rutas protegidas
├── service/          # Lógica de acceso a APIs/backend organizada por dominio
│   ├── Catalogos/
│   ├── Dashboard/
│   ├── Entidades/
│   ├── Registro/
│   ├── Seguridad/
│   └── stepper/
├── utils/            # Utilidades y mappers varios
├── App.jsx           # Root component
├── main.jsx          # Entry point de la app
├── config.js         # Configuración global
└── index.css         # Estilos base

## 5. Principales Módulos y Arquitectura

### 5.1 Hooks Personalizados (`/src/hooks`)

- `useAuth.js`: Manejo de autenticación y usuario activo  
- `useCatalog.js`: Obtención y manejo de catálogos  
- `useData.js`: Lógica para cargar y actualizar datos centralizados  
- `useEntidadFiltrada.js`: Hook para filtrado dinámico de entidades  
- `useUI.js`: Manejo de estados de UI global (modales, toasts, loaders)  

### 5.2 Servicios/API (`/src/service/`)

Organizados por dominio para facilitar mantenimiento:

- `Catalogos/`: Servicios para agencias, productos, firmas, etc.  
- `Dashboard/`: Datos y métricas  
- `Entidades/`: CRUD y lógica para prospectos, clientes, solicitudes, etc.  
- `Registro/`: Procesos de registro  
- `Seguridad/`: Autenticación (`authService.js`)  
- `stepper/`: Flujos multistep (`stepperSolicitud.js`)  

### 5.3 Componentes Reutilizables (`/src/components/`)

- `ui/`: Botones, inputs, modales, tablas, alertas (Tailwind + Radix UI)  
- `shared/`: Tablas y vistas para catálogos y entidades  
- `dashboard/`: Sidebar, Header, Footer  
- `solicitud/`: Secciones del flujo de solicitud  
- `prospectos/`: Modales y vistas específicas  

### 5.4 Rutas (`/src/routes/`)

- `AppRoutes.jsx`: Configuración de rutas  
- `ProtectedRoute.jsx`: Rutas protegidas por autenticación  

### 5.5 Contextos (`/src/contexts/`)

- `AuthContext`: Sesión y autenticación  
- `CatalogContext`: Catálogos globales  
- `DataContext`: Datos compartidos  
- `UIContext`: Modales, loaders, toasts, etc.  

---

## 6. Páginas y Navegación (`/src/pages/`)

- `Auth/`: Login, registro, recuperación de contraseña  
- `Catalogo/`: CRUD de catálogos (agencias, productos, etc.)  
- `Entidad/`: Clientes, prospectos, tareas, inversiones, etc.  
- `Legal/`: Términos y políticas  
- `Panel/`: Dashboard del usuario  

---

## 7. Estilos

- Basado en **TailwindCSS**, con soporte para **dark mode**  
- Componentes desacoplados y fácilmente extensibles  
- Estilos globales definidos en `index.css`  

---

## 8. Convenciones de Código

- Componentes en **PascalCase** (`Componente.jsx`)  
- Hooks inician con `useX`  
- Servicios terminan en `Service.js`  
- Uso de **PropTypes** o **Zod** para validación  
- Separación estricta entre lógica y presentación  

---

## 9. Deployment

- Compilar con `npm run build` (salida en `/dist`)  
- Listo para Vercel, Netlify, Azure Static Web Apps, etc.  
- Variables definidas en `.env` y `.env.production`  

---

## 10. Notas y Buenas Prácticas

- Documentar hooks y servicios nuevos  
- Mantener separación de responsabilidades  
- Usar contextos para evitar prop-drilling  
- Mantener actualizado el **linter** y las dependencias  

---

## 11. Créditos y Licencia

- **Desarrollado por**: Kevin Rosero, Martin Vargas  
- **Licencia**: SG CONSULTING GROUP – All rights reserved
