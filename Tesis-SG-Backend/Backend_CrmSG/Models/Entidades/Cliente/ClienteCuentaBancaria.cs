using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades.Cliente
{
    public class ClienteCuentaBancaria
    {
        [Key]
        public int IdCliente { get; set; }
        public int IdBanco { get; set; }
        public int IdTipoCuenta { get; set; }
        public string NumeroCuenta { get; set; } = "";
    }

}
