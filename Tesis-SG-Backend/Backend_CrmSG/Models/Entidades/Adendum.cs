using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades
{
    public class Adendum
    {
        [Key]
        public int IdAdendum { get; set; }
        public int IdInversion { get; set; }
        public int? IdProyeccionOriginal { get; set; }
        public int? IdProyeccionIncremento { get; set; }
        public int IdCronogramaProyeccionOriginal { get; set; }
        public int? IdCronogramaProyeccionIncremento { get; set; }
        public string? NombreAdendum { get; set; }
        public int? PeriodoIncremento { get; set; }
        public decimal? MontoIncremento { get; set; }
        public int Estado { get; set; } // 1: Proyectado, 2: Cargar abono, 3: Completado
        public bool GenerarDocumentos { get; set; }
        public bool ContinuarFlujo { get; set; }

        // Tracking
        public int IdUsuarioCreacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int? IdUsuarioPropietario { get; set; }
    }
}
