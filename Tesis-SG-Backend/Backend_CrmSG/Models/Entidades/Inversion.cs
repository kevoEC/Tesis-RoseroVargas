using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_CrmSG.Models.Entidades
{
    [Table("Inversion")]
    public class Inversion
    {
        [Key]
        public int IdInversion { get; set; }

        [Required]
        [MaxLength(150)]
        public string InversionNombre { get; set; } = "";

        [Required]
        public int IdCliente { get; set; }

        [Required]
        public int IdProyeccion { get; set; }

        [Required]
        public int IdSolicitudInversion { get; set; }

        [Required]
        public bool Terminada { get; set; } // o int si en la DB es tinyint/bit (cambia a int si fuera tinyint)

        public int? IdTipoTerminacion { get; set; }

        [Required]
        public int IdUsuarioPropietario { get; set; }

        [Required]
        public int IdUsuarioCreacion { get; set; }

        [Required]
        public DateTime FechaCreacion { get; set; }

        public int? IdUsuarioModificacion { get; set; }

        public DateTime? FechaModificacion { get; set; }
    }
}
