using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Models.Vistas
{
    [Keyless]
    public class CasoDetalleExtendida
    {
        public int IdCaso { get; set; }
        public string NumeroCaso { get; set; } = string.Empty;
        public int IdCliente { get; set; }
        public string NombreCliente { get; set; } = string.Empty;
        public int IdMotivo { get; set; }
        public string? MotivoNombre { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public int? IdInversion { get; set; }
        public int? IdPago { get; set; }
        public bool ContinuarCaso { get; set; }
        public string Estado { get; set; } = "Iniciado";
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public string? NombreUsuarioCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public string? NombreUsuarioModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public string? NombreUsuarioPropietario { get; set; }

        // Campos descompuestos del JSON (para motivos de pago y otros)
        public string? FechaCorte { get; set; }
        public string? CorreoEnvio { get; set; }
        public int? TipoPago { get; set; }
        public string? FechaPago { get; set; }
        public decimal? MontoPago { get; set; }
        public int? BancoPago { get; set; }
        public int? TipoCuentaPago { get; set; }
        public string? NumeroCuentaPago { get; set; }
        public int? TipoTerminacion { get; set; }
        public string? FechaTerminacionContrato { get; set; }
    }
}
