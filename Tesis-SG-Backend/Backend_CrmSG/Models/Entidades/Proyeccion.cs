using Backend_CrmSG.Models.Catalogos.Producto;
using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades
{
    public class Proyeccion
    {
        [Key]
        public int IdProyeccion { get; set; }

        public string ProyeccionNombre { get; set; } = string.Empty;

        public int IdProducto { get; set; }
        public Producto? Producto { get; set; }

        public short Plazo { get; set; }

        public DateTime FechaInicial { get; set; }
        public DateTime? FechaVencimiento { get; set; }
            
        public decimal Tasa { get; set; }
        public decimal Capital { get; set; }
        public decimal? AporteAdicional { get; set; }
        public decimal? CosteOperativo { get; set; }
        public decimal? CosteNotarizacion { get; set; }

        public decimal? TotalRentabilidad { get; set; }
        public decimal? TotalCosteOperativo { get; set; }
        public decimal? TotalRentaPeriodo { get; set; }
        public decimal? RendimientosMasCapital { get; set; }
        public decimal? ValorProyectadoLiquidar { get; set; }
        public decimal? TotalAporteAdicional { get; set; }

        public DateTime? FechaIncremento { get; set; }

        public int? IdOrigenCapital { get; set; }

        public int? IdOrigenIncremento { get; set; }

        public int? IdConfiguracionesProducto { get; set; }
        public ConfiguracionesProducto? ConfiguracionUsada { get; set; }

        public int? IdSolicitudInversion { get; set; }
        public SolicitudInversion? SolicitudInversion { get; set; }

        public int? IdUsuarioCreacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }

        public ICollection<CronogramaProyeccion>? Cronogramas { get; set; }

    }

}
