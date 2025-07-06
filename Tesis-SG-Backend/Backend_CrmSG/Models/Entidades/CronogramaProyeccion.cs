using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_CrmSG.Models.Entidades
{
    public class CronogramaProyeccion
    {
        [Key]
        public int IdCronogramaProyeccion { get; set; }

        public int IdProyeccion { get; set; }

        [ForeignKey(nameof(IdProyeccion))]
        public Proyeccion? Proyeccion { get; set; }

        public string PeriodosJson { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }

        public int Version { get; set; }
        public bool EsActivo { get; set; }
        public int? ReferenciaOriginal { get; set; }
    }

}
