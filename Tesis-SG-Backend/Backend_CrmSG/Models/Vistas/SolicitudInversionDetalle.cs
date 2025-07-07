namespace Backend_CrmSG.Models.Vistas
{
    public class SolicitudInversionDetalle
    {
        public int IdSolicitudInversion { get; set; }
        public int? FaseProceso { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public string? JSONDocument { get; set; }

        public int? IdProspecto { get; set; }
        public string? NombreCompletoProspecto { get; set; }

        public int? IdCliente { get; set; }
        public string? NombreCompletoCliente { get; set; }

        public int? IdUsuarioPropietario { get; set; }
        public string? NombrePropietario { get; set; }

        public int? IdUsuarioModificacion { get; set; }
        public string? NombreModificacion { get; set; }

        // Identificación
        public int? IdTipoSolicitud { get; set; }
        public string? NombreTipoSolicitud { get; set; }
        public int? IdTipoCliente { get; set; }
        public string? NombreTipoCliente { get; set; }
        public int? IdTipoDocumento { get; set; }
        public string? NombreTipoDocumento { get; set; }
        public string? NumeroDocumento { get; set; }
        public string? Nombres { get; set; }
        public string? ApellidoPaterno { get; set; }
        public string? ApellidoMaterno { get; set; }
        public bool? Validar { get; set; }
        public string? Equifax { get; set; }
        public string? ObsEquifax { get; set; }
        public string? ListasControl { get; set; }
        public string? ObsListasControl { get; set; }
        public string? Continuar { get; set; }

        // Proyección
        public int? IdAsesorComercial { get; set; }
        public string? NombreAsesorComercial { get; set; }
        public int? IdProyeccionSeleccionada { get; set; }
        public string? ProyeccionNombre { get; set; }
        public int? IdJustificativoTransaccion { get; set; }
        public string? NombreJustificativoTransaccion { get; set; }
        public string? OrigenFondos { get; set; }
        public bool? EnviarProyeccion { get; set; }
        public bool? ClienteAcepta { get; set; }

        // Datos Generales
        public int? IdGenero { get; set; }
        public string? NombreGenero { get; set; }
        public int? IdEstadoCivil { get; set; }
        public string? NombreEstadoCivil { get; set; }
        public int? IdNivelAcademico { get; set; }
        public string? NombreNivelAcademico { get; set; }
        public int? NumeroCargasFamiliares { get; set; }
        public int? IdNacionalidad { get; set; }
        public string? NombreNacionalidad { get; set; }
        public int? IdProfesion { get; set; }
        public string? NombreProfesion { get; set; }
        public int? IdEtnia { get; set; }
        public string? NombreEtnia { get; set; }
        public DateTime? FechaNacimiento { get; set; }

        // Actividad Económica
        public int? IdActividadEconomicaPrincipal { get; set; }
        public string? NombreActividadEconomicaPrincipal { get; set; }
        public int? IdActividadEconomicaLugarTrabajo { get; set; }
        public string? NombreActividadEconomicaLugarTrabajo { get; set; }
        public string? LugarTrabajo { get; set; }
        public string? CorreoTrabajo { get; set; }
        public string? OtraActividadEconomica { get; set; }
        public string? Cargo { get; set; }
        public int? Antiguedad { get; set; }
        public string? TelefonoTrabajo { get; set; }
        public DateTime? FechaInicioActividad { get; set; }
        public string? DireccionTrabajo { get; set; }
        public string? ReferenciaDireccionTrabajo { get; set; }
        public bool? EsPEP { get; set; }

        // Datos Económicos
        public decimal? TotalIngresosMensuales { get; set; }
        public decimal? TotalEgresosMensuales { get; set; }
        public decimal? TotalActivos { get; set; }
        public decimal? TotalPasivos { get; set; }
        public decimal? ActivosMuebles { get; set; }
        public decimal? ActivosInmuebles { get; set; }
        public decimal? ActivosTitulosValor { get; set; }
        public decimal? IngresosFijos { get; set; }
        public decimal? IngresosVariables { get; set; }
        public string? OrigenIngresoVariable { get; set; }
        public decimal? PatrimonioNeto { get; set; }

        // Contacto y Ubicación
        public string? CorreoElectronico { get; set; }
        public string? OtroTelefono { get; set; }
        public string? TelefonoCelular { get; set; }
        public string? TelefonoFijo { get; set; }
        public int? IdTipoVia { get; set; }
        public string? NombreTipoVia { get; set; }
        public string? CallePrincipal { get; set; }
        public string? NumeroDomicilio { get; set; }
        public string? CalleSecundaria { get; set; }
        public string? ReferenciaDomicilio { get; set; }
        public string? SectorBarrio { get; set; }
        public int? TiempoResidencia { get; set; }
        public int? IdPaisResidencia { get; set; }
        public string? NombrePaisResidencia { get; set; }
        public int? IdProvinciaResidencia { get; set; }
        public string? NombreProvinciaResidencia { get; set; }
        public int? IdCiudadResidencia { get; set; }
        public string? NombreCiudadResidencia { get; set; }
        public bool? ResidenteOtroPais { get; set; }
        public bool? ContribuyenteEEUU { get; set; }
        public string? NumeroIdentificacionOtroPais { get; set; }
        public string? NumeroIdentificacionEEUU { get; set; }

        // Información Bancaria
        public int? IdBanco { get; set; }
        public string? BancoNombre { get; set; }
        public int? IdTipoCuenta { get; set; }
        public string? NombreTipoCuenta { get; set; }
        public string? NumeroCuenta { get; set; }

        // Adjuntos
        public int? IdModoFirma { get; set; }
        public string? NombreModoFirma { get; set; }
        public bool? VerDocumentosRequeridos { get; set; }
        public bool? ConfirmaCargaDocumentosCorrectos { get; set; }

        // Finalización
        public string? NumeroContrato { get; set; }
        public int? IdContinuarSolicitud { get; set; }
        public string? NombreContinuarSolicitud { get; set; }
        public string? MotivoFinalizacion { get; set; }
        public string? ObservacionFinalizacion { get; set; }
        public bool? Confirmar { get; set; }
    }

}
