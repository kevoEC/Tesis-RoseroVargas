using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_CrmSG.Models.Entidades
{
    [Table("Pago")]
    public class Pago
    {
        [Key]
        public int IdPago { get; set; }
        public int IdCalendario { get; set; }
        public int CantidadPagos { get; set; }
        public bool DescartarPagos { get; set; }
        public bool GenerarPagos { get; set; }
        public string Detalle { get; set; } = string.Empty;
        public bool ConfirmarRegistrosPagos { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
    }
}
