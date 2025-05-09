// routes/index.js

import { lazy } from "react";
import LoginRedirect from "@/components/LoginRedirect";

const Settings = lazy(() => import("@/pages/Settings"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Register = lazy(() => import("@/pages/Auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));
const Clausula = lazy(() => import("@/pages/Legal/ClausulaInformativa"));
const Terminos = lazy(() => import("@/pages/Legal/TerminosCondiciones"));
const Politica = lazy(() => import("@/pages/Legal/PoliticaPrivacidad"));

const DashboardPanel = lazy(() => import("@/pages/Panel/Dashboard"));

const Prospectos = lazy(() => import("@/pages/Entidad/Prospectos/Prospectos"));
const ProspectoForm = lazy(() =>
  import("@/pages/Entidad/Prospectos/ProspectoForm")
);
const ProspectoDetalle = lazy(() =>
  import("@/pages/Entidad/Prospectos/ProspectoDetalle")
);

const Solicitudes = lazy(() =>
  import("@/pages/Entidad/Solicitudes/SolicitudInversion")
);
const SolicitudesForm = lazy(() =>
  import("@/pages/Entidad/Solicitudes/SolicitudInversionForm")
);
const SolicitudesDetalle = lazy(() =>
  import("@/pages/Entidad/Solicitudes/SolicitudesDetalle")
);

const Agencias = lazy(() => import("@/pages/Catalogo/Agencia/Agencia"));
const AgenciaForm = lazy(() => import("@/pages/Catalogo/Agencia/AgenciaForm"));

const OrigenCliente = lazy(() =>
  import("@/pages/Catalogo/OrigenPotencial/OrigenPotencial")
);
const OrigenClienteForm = lazy(() =>
  import("@/pages/Catalogo/OrigenPotencial/OrigenClienteForm")
);

const TipoProducto = lazy(() =>
  import("@/pages/Catalogo/ProductoInteres/ProductoInteres")
);
const TipoProductoForm = lazy(() =>
  import("@/pages/Catalogo/ProductoInteres/ProductoInteresForm")
);

const Prioridad = lazy(() => import("@/pages/Catalogo/Prioridad"));
const PrioridadForm = lazy(() => import("@/pages/Catalogo/PrioridadForm"));

const TipoSolicitud = lazy(() => import("@/pages/Catalogo/TipoSolicitud"));
const TipoSolicitudForm = lazy(() =>
  import("@/pages/Catalogo/TipoSolicitudForm")
);

const TipoCliente = lazy(() => import("@/pages/Catalogo/TipoCliente"));
const TipoClienteForm = lazy(() => import("@/pages/Catalogo/TipoClienteForm"));

const TipoIdentificacion = lazy(() =>
  import("@/pages/Catalogo/TipoIdentificacion")
);
const TipoIdentificacionForm = lazy(() =>
  import("@/pages/Catalogo/TipoIdentificacionForm")
);

const ProductoInteres = lazy(() => import("@/pages/Catalogo/ProductoInteres"));
const TipoActividad = lazy(() => import("@/pages/Catalogo/TipoActividad"));

const TipoActividadForm = lazy(() =>
  import("@/pages/Catalogo/TipoActividadForm")
);

const Proyeccion = lazy(() =>
  import("@/pages/Entidad/Proyecciones/ProyeccionNueva")
);
const Pruebaflujo = lazy(() => import("@/pages/FlujoSolicitud"));

export const publicRoutes = [
  { path: "/login", element: <LoginRedirect /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/legal/clausula", element: <Clausula /> },
  { path: "/legal/terminos", element: <Terminos /> },
  { path: "/legal/privacidad", element: <Politica /> },
  { path: "/prueba", element: <Pruebaflujo /> },
];

export const protectedRoutes = [
  // Panel de métricas
  { path: "/panel/metricas", element: <DashboardPanel /> },

  {
    path: "/debug/prueba",
    element: (
      <div style={{ color: "green", fontSize: "2rem" }}>
        ✅ Hola desde Debug Route
      </div>
    ),
  },

  // Prospectos
  { path: "/prospectos/vista", element: <Prospectos /> },
  { path: "/prospectos/nuevo", element: <ProspectoForm /> },
  { path: "/prospectos/editar/:id", element: <ProspectoDetalle /> },

  // Solicitudes de inversión
  { path: "/solicitudes/vista", element: <Solicitudes /> },
  { path: "/solicitudes/nuevo", element: <SolicitudesForm /> },
  { path: "/solicitudes/editar/:id", element: <SolicitudesDetalle /> },
  { path: "/solicitudes/editar/:id/proyeccion/nueva", element: <Proyeccion /> },

  // Inversiones
  { path: "/inversiones/vista", element: <Prospectos /> },
  // Clientes
  { path: "/clientes/vista", element: <Prospectos /> },
  // Tareas
  { path: "/tareas/vista", element: <Prospectos /> },
  // Casos
  { path: "/casos/vista", element: <Prospectos /> },
  // Pagos
  { path: "/pagos/vista", element: <Prospectos /> },
  // Calendario
  { path: "/calendario/vista", element: <Prospectos /> },

  // Configuraciones generales
  { path: "/settings", element: <Settings /> },

  // Catálogo de agencias
  { path: "/catalogo/agencia/vista", element: <Agencias /> },
  { path: "/catalogo/agencia/nuevo", element: <AgenciaForm /> },
  { path: "/catalogo/agencia/editar/:id", element: <AgenciaForm /> },

  // Catálogo de origenes potenciales
  { path: "/catalogo/origenpotencial/vista", element: <OrigenCliente /> },
  { path: "/catalogo/origenpotencial/nuevo", element: <OrigenClienteForm /> },
  {
    path: "/catalogo/origenpotencial/editar/:id",
    element: <OrigenClienteForm />,
  },

  // Catálogo de tipo de producto
  { path: "/catalogo/productointeres/vista", element: <TipoProducto /> },
  { path: "/catalogo/productointeres/nuevo", element: <TipoProductoForm /> },
  {
    path: "/catalogo/productointeres/editar/:id",
    element: <TipoProductoForm />,
  },

  // Otros catálogos generales
  { path: "/catalogo/prioridad/vista", element: <Prioridad /> },
  { path: "/catalogo/prioridad/nuevo", element: <PrioridadForm /> },
  { path: "/catalogo/prioridad/editar/:id", element: <PrioridadForm /> },

  { path: "/catalogo/tiposolicitud/vista", element: <TipoSolicitud /> },
  { path: "/catalogo/tiposolicitud/nuevo", element: <TipoSolicitudForm /> },
  {
    path: "/catalogo/tiposolicitud/editar/:id",
    element: <TipoSolicitudForm />,
  },

  { path: "/catalogo/tipocliente/vista", element: <TipoCliente /> },
  { path: "/catalogo/tipocliente/nuevo", element: <TipoClienteForm /> },
  { path: "/catalogo/tipocliente/editar/:id", element: <TipoClienteForm /> },

  {
    path: "/catalogo/tipoidentificacion/vista",
    element: <TipoIdentificacion />,
  },
  {
    path: "/catalogo/tipoidentificacion/nuevo",
    element: <TipoIdentificacionForm />,
  },
  {
    path: "/catalogo/tipoidentificacion/editar/:id",
    element: <TipoIdentificacionForm />,
  },

  { path: "/catalogo/productointeres/vista", element: <ProductoInteres /> },

  { path: "/catalogo/tipoactividad/vista", element: <TipoActividad /> },
  { path: "/catalogo/tipoactividad/nuevo", element: <TipoActividadForm /> },
  {
    path: "/catalogo/tipoactividad/editar/:id",
    element: <TipoActividadForm />,
  },
  //Proyección Express
  { path: "proyeccion/vista", element: <Proyeccion /> },
];

export const fallbackRoutes = [{ path: "*", element: <NotFound /> }];
