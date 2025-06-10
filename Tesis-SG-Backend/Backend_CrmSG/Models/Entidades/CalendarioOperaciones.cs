using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades
{
    public class CalendarioOperaciones
    {
        [Key]
        public int IdCalendario { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public DateTime FechaCorte { get; set; }
        public string CalendarioInversiones { get; set; } = string.Empty;
        public DateTime FechaGenerarPagos { get; set; }
        public DateTime FechaEnvioEECC { get; set; }
        public bool EstadoProcesoPagos { get; set; }
        public bool EstadoProcesoEnvioEECC { get; set; }
        public bool EstadoCalendario { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
    }
}
