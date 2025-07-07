using Backend_CrmSG.DTOs.SolicitudDTOs;
using Backend_CrmSG.DTOs.Solicitudes;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Models.Vistas;
using System.Text.Json;

public static class SolicitudMapper
{
    public static SolicitudInversionDTO MapearDesdeVista(SolicitudInversionDetalle vista)
    {
        return new SolicitudInversionDTO
        {
            IdSolicitudInversion = vista.IdSolicitudInversion,
            FaseProceso = vista.FaseProceso,
            IdUsuarioPropietario = vista.IdUsuarioPropietario,
            IdProspecto = vista.IdProspecto,
            IdCliente = vista.IdCliente,
            NombreCompletoProspecto = vista.NombreCompletoProspecto,
            NombreCompletoCliente = vista.NombreCompletoCliente,
            NombrePropietario = vista.NombrePropietario,
            NombreModificacion = vista.NombreModificacion,
            FechaCreacion = vista.FechaCreacion,
            FechaModificacion = vista.FechaModificacion,
            IdUsuarioModificacion = vista.IdUsuarioModificacion,

            Identificacion = new IdentificacionDTO
            {
                IdTipoSolicitud = vista.IdTipoSolicitud ?? 0,
                NombreTipoSolicitud = vista.NombreTipoSolicitud,
                IdTipoCliente = vista.IdTipoCliente ?? 0,
                NombreTipoCliente = vista.NombreTipoCliente,
                IdTipoDocumento = vista.IdTipoDocumento ?? 0,
                NombreTipoDocumento = vista.NombreTipoDocumento,
                NumeroDocumento = vista.NumeroDocumento ?? "",
                Nombres = vista.Nombres ?? "",
                ApellidoPaterno = vista.ApellidoPaterno ?? "",
                ApellidoMaterno = vista.ApellidoMaterno ?? "",
                Validar = vista.Validar ?? false,
                Equifax = vista.Equifax,
                ObsEquifax = vista.ObsEquifax,
                ListasControl = vista.ListasControl,
                ObsListasControl = vista.ObsListasControl,
                Continuar = vista.Continuar
            },
            Proyeccion = new ProyeccionDTO
            {
                IdAsesorComercial = vista.IdAsesorComercial,
                NombreAsesorComercial = vista.NombreAsesorComercial,
                IdProyeccionSeleccionada = vista.IdProyeccionSeleccionada,
                ProyeccionNombre = vista.ProyeccionNombre,
                IdJustificativoTransaccion = vista.IdJustificativoTransaccion,
                NombreJustificativoTransaccion = vista.NombreJustificativoTransaccion,
                OrigenFondos = vista.OrigenFondos,
                EnviarProyeccion = vista.EnviarProyeccion,
                ClienteAcepta = vista.ClienteAcepta
            },
            DatosGenerales = new DatosGeneralesDTO
            {
                IdGenero = vista.IdGenero,
                NombreGenero = vista.NombreGenero,
                IdEstadoCivil = vista.IdEstadoCivil,
                NombreEstadoCivil = vista.NombreEstadoCivil,
                IdNivelAcademico = vista.IdNivelAcademico,
                NombreNivelAcademico = vista.NombreNivelAcademico,
                NumeroCargasFamiliares = vista.NumeroCargasFamiliares,
                IdNacionalidad = vista.IdNacionalidad,
                NombreNacionalidad = vista.NombreNacionalidad,
                IdProfesion = vista.IdProfesion,
                NombreProfesion = vista.NombreProfesion,
                IdEtnia = vista.IdEtnia,
                NombreEtnia = vista.NombreEtnia,
                FechaNacimiento = vista.FechaNacimiento
            },
            ActividadEconomica = new ActividadEconomicaDTO
            {
                IdActividadEconomicaPrincipal = vista.IdActividadEconomicaPrincipal,
                NombreActividadEconomicaPrincipal = vista.NombreActividadEconomicaPrincipal,
                IdActividadEconomicaLugarTrabajo = vista.IdActividadEconomicaLugarTrabajo,
                NombreActividadEconomicaLugarTrabajo = vista.NombreActividadEconomicaLugarTrabajo,
                LugarTrabajo = vista.LugarTrabajo,
                CorreoTrabajo = vista.CorreoTrabajo,
                OtraActividadEconomica = vista.OtraActividadEconomica,
                Cargo = vista.Cargo,
                Antiguedad = vista.Antiguedad,
                TelefonoTrabajo = vista.TelefonoTrabajo,
                FechaInicioActividad = vista.FechaInicioActividad,
                DireccionTrabajo = vista.DireccionTrabajo,
                ReferenciaDireccionTrabajo = vista.ReferenciaDireccionTrabajo,
                EsPEP = vista.EsPEP
            },
            DatosEconomicos = new DatosEconomicosDTO
            {
                TotalIngresosMensuales = vista.TotalIngresosMensuales,
                TotalEgresosMensuales = vista.TotalEgresosMensuales,
                TotalActivos = vista.TotalActivos,
                TotalPasivos = vista.TotalPasivos,
                ActivosMuebles = vista.ActivosMuebles,
                ActivosInmuebles = vista.ActivosInmuebles,
                ActivosTitulosValor = vista.ActivosTitulosValor,
                IngresosFijos = vista.IngresosFijos,
                IngresosVariables = vista.IngresosVariables,
                OrigenIngresoVariable = vista.OrigenIngresoVariable,
                PatrimonioNeto = vista.PatrimonioNeto
            },
            ContactoUbicacion = new ContactoUbicacionDTO
            {
                CorreoElectronico = vista.CorreoElectronico,
                OtroTelefono = vista.OtroTelefono,
                TelefonoCelular = vista.TelefonoCelular,
                TelefonoFijo = vista.TelefonoFijo,
                IdTipoVia = vista.IdTipoVia,
                NombreTipoVia = vista.NombreTipoVia,
                CallePrincipal = vista.CallePrincipal,
                NumeroDomicilio = vista.NumeroDomicilio,
                CalleSecundaria = vista.CalleSecundaria,
                ReferenciaDomicilio = vista.ReferenciaDomicilio,
                SectorBarrio = vista.SectorBarrio,
                TiempoResidencia = vista.TiempoResidencia,
                IdPaisResidencia = vista.IdPaisResidencia,
                NombrePaisResidencia = vista.NombrePaisResidencia,
                IdProvinciaResidencia = vista.IdProvinciaResidencia,
                NombreProvinciaResidencia = vista.NombreProvinciaResidencia,
                IdCiudadResidencia = vista.IdCiudadResidencia,
                NombreCiudadResidencia = vista.NombreCiudadResidencia,
                ResidenteOtroPais = vista.ResidenteOtroPais,
                ContribuyenteEEUU = vista.ContribuyenteEEUU,
                NumeroIdentificacionOtroPais = vista.NumeroIdentificacionOtroPais,
                NumeroIdentificacionEEUU = vista.NumeroIdentificacionEEUU
            },
            Banco = new BancoDTO
            {
                IdBanco = vista.IdBanco,
                BancoNombre = vista.BancoNombre,
                IdTipoCuenta = vista.IdTipoCuenta,
                NombreTipoCuenta = vista.NombreTipoCuenta,
                NumeroCuenta = vista.NumeroCuenta
            },
            Adjuntos = new AdjuntosDTO
            {
                IdModoFirma = vista.IdModoFirma,
                NombreModoFirma = vista.NombreModoFirma,
                VerDocumentosRequeridos = vista.VerDocumentosRequeridos,
                ConfirmaCargaDocumentosCorrectos = vista.ConfirmaCargaDocumentosCorrectos
            },
            Finalizacion = new FinalizacionDTO
            {
                NumeroContrato = vista.NumeroContrato,
                IdContinuarSolicitud = vista.IdContinuarSolicitud,
                NombreContinuarSolicitud = vista.NombreContinuarSolicitud,
                MotivoFinalizacion = vista.MotivoFinalizacion,
                ObservacionFinalizacion = vista.ObservacionFinalizacion,
                Confirmar = vista.Confirmar
            }
        };
    }

    public static SolicitudInversion MapearParaCrear(SolicitudInversionCreateDTO dto)
    {
        var jsonPayload = JsonSerializer.Serialize(new
        {
            identificacion = dto.Identificacion
        }, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        return new SolicitudInversion
        {
            FechaCreacion = DateTime.UtcNow,
            FechaModificacion = DateTime.UtcNow,
            IdUsuarioPropietario = dto.IdUsuarioPropietario,
            IdProspecto = dto.IdProspecto,
            IdCliente = dto.IdCliente,
            JSONDocument = jsonPayload,
            FaseProceso = 1 // ← ***AGREGA ESTA LÍNEA***
        };
    }




    public static SolicitudInversion MapearParaActualizar(int id, SolicitudInversionUpdateDTO dto)
    {
        var jsonPayload = JsonSerializer.Serialize(new
        {
            identificacion = dto.Identificacion,
            proyeccion = dto.Proyeccion,
            datosGenerales = dto.DatosGenerales,
            actividadEconomica = dto.ActividadEconomica,
            datosEconomicos = dto.DatosEconomicos,
            contactoUbicacion = dto.ContactoUbicacion,
            banco = dto.Banco,
            finalizacion = dto.Finalizacion,
            adjuntos = dto.Adjuntos
        }, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        });

        return new SolicitudInversion
        {
            IdSolicitudInversion = id,
            FechaModificacion = DateTime.UtcNow,
            IdUsuarioPropietario = dto.IdUsuarioPropietario,
            IdProspecto = dto.IdProspecto,
            IdCliente = dto.IdCliente,
            JSONDocument = jsonPayload,
            FaseProceso = 1 // ← ***AGREGA ESTA LÍNEA***
        };
    }




}
