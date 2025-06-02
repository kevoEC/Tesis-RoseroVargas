using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades.Cliente
{
    public class ClienteActividadEconomica
    {
        [Key]
        public int IdCliente { get; set; }
        public int IdActividadPrincipal { get; set; }
        public int IdActividadLugarTrabajo { get; set; }
        public string LugarTrabajo { get; set; } = "";
        public string CorreoTrabajo { get; set; } = "";
        public string OtraActividad { get; set; } = "";
        public string Cargo { get; set; } = "";
        public int Antiguedad { get; set; }
        public string TelefonoTrabajo { get; set; } = "";
        public DateTime FechaInicioActividad { get; set; }
        public string DireccionTrabajo { get; set; } = "";
        public string ReferenciaDireccionTrabajo { get; set; } = "";
        public bool EsPEP { get; set; }
    }

}
