using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades
{
    public class Caso
    {
        [Key]
        public int IdCaso { get; set; }
        public string NumeroCaso { get; set; } = string.Empty;
        public int IdCliente { get; set; }
        public int IdMotivo { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public int? IdInversion { get; set; }
        public int? IdPago { get; set; }
        public string DatosEspecificos { get; set; } = string.Empty; // JSON puro, el backend puede parsear si es necesario
        public bool ContinuarCaso { get; set; }
        public string Estado { get; set; } = "Iniciado";
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
    }
}
