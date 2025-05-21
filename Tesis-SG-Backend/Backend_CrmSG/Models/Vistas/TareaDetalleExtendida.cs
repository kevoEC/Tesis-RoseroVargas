using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Models.Vistas
{
    [Keyless]
    public class TareaDetalleExtendida
    {
        public int IdTarea { get; set; }
        public string TareaNombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int IdResultado { get; set; }
        public string? NombreResultado { get; set; }
        public string? Observación { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public string? NombreUsuarioCreacion { get; set; }
        public DateTime FechaCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public string? NombreUsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public string? NombreUsuarioPropietario { get; set; }
        public string DatosEspecificos { get; set; } = string.Empty;
        public int IdTipoTarea { get; set; }
        public string? NombreTipoTarea { get; set; }
        public int IdSolicitudInversion { get; set; }

        // TipoTarea 1: Revisión Documental
        public bool? ReemplazarContrato { get; set; }
        public bool? ReemplazarAnexo { get; set; }

        // TipoTarea 2: Revisión Legal
        public bool? ReemplazarContratoAdendum { get; set; }

        // TipoTarea 3: Contrato
        public bool? FirmadoGerencia { get; set; }
        public int? IdTipoFirma { get; set; }

        // TipoTarea 4: Comprobante de Abono
        public string? DatosTarea { get; set; }

        // TipoTarea 5: Conciliación
        public string? FechaOperacion { get; set; }
        public string? CuentaAbono { get; set; }
        public string? NumeroComprobanteAbono { get; set; }

        // TipoTarea 6: Revisión por Riesgo
        public string? FechaValidacionRiesgo { get; set; }
        public string? PorcentajeCoincidenciaRiesgo { get; set; }
    }
}
