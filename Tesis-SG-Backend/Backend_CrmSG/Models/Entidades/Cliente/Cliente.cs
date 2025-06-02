using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades.Cliente
{
    public class Cliente
    {
        [Key]
        public int IdCliente { get; set; }
        public int IdTipoCliente { get; set; }
        public int IdTipoIdentificacion { get; set; }
        public string NumeroDocumento { get; set; } = "";
        public string Nombres { get; set; } = "";
        public string ApellidoPaterno { get; set; } = "";
        public string ApellidoMaterno { get; set; } = "";
        public DateTime FechaNacimiento { get; set; }
        public int IdGenero { get; set; }
        public int IdEstadoCivil { get; set; }
        public int IdNacionalidad { get; set; }
        public int IdNivelAcademico { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public bool ActualizacionDatos { get; set; }

    }

}
