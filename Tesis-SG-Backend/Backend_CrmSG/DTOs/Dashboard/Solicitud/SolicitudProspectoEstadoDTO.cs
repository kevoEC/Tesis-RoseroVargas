namespace Backend_CrmSG.DTOs.Dashboard.Solicitud
{
    public class SolicitudProspectoEstadoDTO
    {
        public int IdProspecto { get; set; }
        public string? Nombres { get; set; }
        public string? ApellidoPaterno { get; set; }
        public int? UltimoEstadoSolicitud { get; set; }
    }
}
