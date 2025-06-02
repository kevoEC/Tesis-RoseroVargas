using Backend_CrmSG.Models.Entidades.Cliente;

namespace Backend_CrmSG.DTOs
{
    public class ClienteUpdateDTO
    {
        // *** Cliente ***
        public int IdCliente { get; set; }
        public int IdGenero { get; set; }
        public int IdEstadoCivil { get; set; }
        public int IdNacionalidad { get; set; }
        public int IdNivelAcademico { get; set; }
        public int IdUsuarioModificacion { get; set; }

        // *** ClienteContacto ***
        public ClienteContacto? Contacto { get; set; }

        // *** ClienteActividadEconomica ***
        public ClienteActividadEconomica? ActividadEconomica { get; set; }

        // *** ClienteCuentaBancaria ***
        public ClienteCuentaBancaria? CuentaBancaria { get; set; }

        // *** ClienteEconomico (si aplica) ***
        public ClienteEconomico? DatosEconomicos { get; set; }
    }

}
