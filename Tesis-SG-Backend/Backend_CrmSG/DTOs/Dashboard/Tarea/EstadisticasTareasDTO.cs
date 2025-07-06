namespace Backend_CrmSG.DTOs.Dashboard.Tarea
{
    public class EstadisticasTareasDTO
    {
        public List<TareasPorSolicitudEstadoDTO> ConteoPorSolicitudEstado { get; set; } = new();
        public List<TareasPorTipoEstadoGlobalDTO> MatrizGlobalPorTipoEstado { get; set; } = new();
        public List<TareasPendientesPorSolicitudDTO> PendientesPorSolicitud { get; set; } = new();
        public int ContratosFirmados { get; set; }
        public List<ReporteCumplimientoSolicitudDTO> ReporteCumplimiento { get; set; } = new();
        public List<TareasPendientesGlobalDTO> PendientesPorTipoGlobal { get; set; } = new();
    }
}
