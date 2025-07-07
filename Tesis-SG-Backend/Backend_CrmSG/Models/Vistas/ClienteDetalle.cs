namespace Backend_CrmSG.Models.Vistas
{
    public class ClienteDetalle
    {
        public int IdCliente { get; set; }
        public string Nombres { get; set; } = "";
        public string ApellidoPaterno { get; set; } = "";
        public string ApellidoMaterno { get; set; } = "";
        public string NumeroDocumento { get; set; } = "";
        public DateTime FechaNacimiento { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public bool ActualizacionDatos { get; set; }

        public int IdUsuarioCreacion { get; set; }
        public string UsuarioCreacionNombreCompleto { get; set; } = "";
        public int? IdUsuarioModificacion { get; set; }
        public string? UsuarioModificacionNombreCompleto { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public string UsuarioPropietarioNombreCompleto { get; set; } = "";

        public string TipoCliente { get; set; } = "";
        public string TipoIdentificacion { get; set; } = "";
        public string Genero { get; set; } = "";
        public string EstadoCivil { get; set; } = "";
        public string Nacionalidad { get; set; } = "";
        public string NivelAcademico { get; set; } = "";

        public int? IdActividadPrincipal { get; set; }
        public string? ActividadEconomicaPrincipal { get; set; }
        public int? IdActividadLugarTrabajo { get; set; }
        public string? ActividadEconomicaLugarTrabajo { get; set; }
        public string? LugarTrabajo { get; set; }
        public string? CorreoTrabajo { get; set; }
        public string? OtraActividad { get; set; }
        public string? Cargo { get; set; }
        public int? Antiguedad { get; set; }
        public string? TelefonoTrabajo { get; set; }
        public DateTime? FechaInicioActividad { get; set; }
        public string? DireccionTrabajo { get; set; }
        public string? ReferenciaDireccionTrabajo { get; set; }
        public bool? EsPEP { get; set; }

        public string? CorreoElectronico { get; set; }
        public string? TelefonoCelular { get; set; }
        public string? OtroTelefono { get; set; }
        public string? TelefonoFijo { get; set; }

        public int? IdTipoVia { get; set; }
        public string? TipoVia { get; set; }
        public string? CallePrincipal { get; set; }
        public string? NumeroDomicilio { get; set; }
        public string? CalleSecundaria { get; set; }
        public string? ReferenciaDomicilio { get; set; }
        public string? SectorBarrio { get; set; }
        public int? TiempoResidencia { get; set; }
        public int? IdPaisResidencia { get; set; }
        public string? Pais { get; set; }
        public int? IdProvinciaResidencia { get; set; }
        public string? Provincia { get; set; }
        public int? IdCiudadResidencia { get; set; }
        public string? Ciudad { get; set; }
        public bool? ResidenteOtroPais { get; set; }
        public bool? ContribuyenteEEUU { get; set; }
        public string? NumeroIdentificacionOtroPais { get; set; }
        public string? NumeroIdentificacionEEUU { get; set; }

        public int? IdBanco { get; set; }
        public string? BancoNombre { get; set; }
        public int? IdTipoCuenta { get; set; }
        public string? TipoCuenta { get; set; }
        public string? NumeroCuenta { get; set; }
    }
}
