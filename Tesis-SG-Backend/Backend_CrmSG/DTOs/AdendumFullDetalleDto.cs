using Backend_CrmSG.Models.Entidades;

namespace Backend_CrmSG.DTOs
{
    public class AdendumFullDetalleDto
    {
        public AdendumDetalleDto? Adendum { get; set; }
        public Proyeccion? ProyeccionOriginal { get; set; }
        public List<CronogramaCuotaDto>? CronogramaOriginal { get; set; }
        public Proyeccion? ProyeccionIncremento { get; set; }
        public List<CronogramaCuotaDto>? CronogramaIncremento { get; set; }
    }

}
