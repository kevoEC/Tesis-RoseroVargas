namespace Backend_CrmSG.Models.Vistas
{
    public class InversionDetalle
    {
        public int IdInversion { get; set; }
        public string InversionNombre { get; set; } = "";
        public int IdCliente { get; set; }
        public string NombreCompletoCliente { get; set; } = "";
        public int IdProyeccion { get; set; }
        public int IdSolicitudInversion { get; set; }
        public bool Terminada { get; set; }
        public int? IdTipoTerminacion { get; set; }
        public string? NombreTipoTerminacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public string UsuarioPropietarioNombreCompleto { get; set; } = "";
        public int IdUsuarioCreacion { get; set; }
        public string UsuarioCreacionNombreCompleto { get; set; } = "";
        public int? IdUsuarioModificacion { get; set; }
        public string? UsuarioModificacionNombreCompleto { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int? Periodo { get; set; }
        public DateTime? FechaInicial { get; set; }
        public DateTime? FechaVencimiento { get; set; }
        public decimal? Tasa { get; set; } // money
        public decimal? Capital { get; set; } // money
        public decimal? AporteAdicional { get; set; }
        public decimal? CosteOperativo { get; set; }
        public int? IdUsuarioCreacionProyeccion { get; set; }
        public DateTime? FechaCreacionProyeccion { get; set; }
        public int? IdUsuarioModificacionProyeccion { get; set; }
        public DateTime? FechaModificacionProyeccion { get; set; }
        public int? IdProducto { get; set; }
        public short? Plazo { get; set; } // smallint
        public int? IdOrigenCapital { get; set; }
        public int? IdOrigenIncremento { get; set; }
        public decimal? TotalRentabilidad { get; set; }
        public decimal? TotalCosteOperativo { get; set; }
        public decimal? TotalRentaPeriodo { get; set; }
        public decimal? RendimientosMasCapital { get; set; }
        public decimal? ValorProyectadoLiquidar { get; set; }
        public decimal? TotalAporteAdicional { get; set; }
        public DateTime? FechaIncremento { get; set; }
        public decimal? CosteNotarizacion { get; set; }
        public string? PeriodosJson { get; set; }
    }

}
