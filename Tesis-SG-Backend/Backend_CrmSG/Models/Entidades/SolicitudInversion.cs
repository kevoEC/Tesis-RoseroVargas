using System;
using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades
{
    public class SolicitudInversion
    {
        [Key]
        public int IdSolicitudInversion { get; set; }

        public DateTime? FechaCreacion { get; set; }

        public DateTime? FechaModificacion { get; set; }

        public int? IdUsuarioPropietario { get; set; }

        public string? JSONDocument { get; set; }

        // Nuevos campos agregados
        public int? IdProspecto { get; set; }
        public int? IdCliente { get; set; }
        public int? FaseProceso { get; set; } // 1: Llenado, 2: Tareas, 3: Rechazada, 4: Completada
    }
}
