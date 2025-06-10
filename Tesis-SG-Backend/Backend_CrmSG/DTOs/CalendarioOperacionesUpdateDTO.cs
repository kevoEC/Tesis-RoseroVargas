namespace Backend_CrmSG.DTOs.CalendarioOperaciones
{
    public class CalendarioOperacionesUpdateDTO
    {
        public string Nombre { get; set; } = string.Empty;
        public DateTime FechaCorte { get; set; }
        public string CalendarioInversiones { get; set; } = string.Empty;
        public DateTime FechaGenerarPagos { get; set; }
        public DateTime FechaEnvioEECC { get; set; }
        public bool EstadoProcesoPagos { get; set; }
        public bool EstadoProcesoEnvioEECC { get; set; }
        public bool EstadoCalendario { get; set; }
        public int IdUsuarioModificacion { get; set; }    // ← Puedes obtenerlo del token, o dejarlo aquí si prefieres.
    }
}
