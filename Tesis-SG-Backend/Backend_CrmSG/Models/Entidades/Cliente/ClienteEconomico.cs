using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades.Cliente
{
    public class ClienteEconomico
    {
        [Key]
        public int IdCliente { get; set; }
        public decimal? TotalIngresosMensuales { get; set; }
        public decimal? TotalEgresosMensuales { get; set; }
        public decimal? TotalActivos { get; set; }
        public decimal? TotalPasivos { get; set; }
        public decimal? ActivosMuebles { get; set; }
        public decimal? ActivosInmuebles { get; set; }
        public decimal? ActivosTitulosValor { get; set; }
        public decimal? IngresosFijos { get; set; }
        public decimal? IngresosVariables { get; set; }
        public string? OrigenIngresoVariable { get; set; }
        public decimal? PatrimonioNeto { get; set; }
    }

}
