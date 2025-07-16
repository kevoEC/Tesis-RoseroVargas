using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades.Cliente
{
    public class ClienteContacto
    {
        [Key]
        public int IdCliente { get; set; }
        public string CorreoElectronico { get; set; } = "";
        public string TelefonoCelular { get; set; } = "";
        public string OtroTelefono { get; set; } = "";
        public string TelefonoFijo { get; set; } = "";
        public int IdTipoVia { get; set; }
        public string CallePrincipal { get; set; } = "";
        public string NumeroDomicilio { get; set; } = "";
        public string CalleSecundaria { get; set; } = "";
        public string ReferenciaDomicilio { get; set; } = "";
        public string SectorBarrio { get; set; } = "";
        public int TiempoResidencia { get; set; }
        public int IdPaisResidencia { get; set; }
        public int IdProvinciaResidencia { get; set; }
        public int IdCiudadResidencia { get; set; }
        public bool ResidenteOtroPais { get; set; }
        public bool ContribuyenteEEUU { get; set; }
        public string NumeroIdentificacionOtroPais { get; set; } = "";
        public string NumeroIdentificacionEEUU { get; set; } = "";
    }

}
