namespace Backend_CrmSG.DTOs.Dashboard.Tarea
{
    public class ReporteCumplimientoSolicitudDTO
    {
        public int IdSolicitudInversion { get; set; }
        public bool DocAprobada { get; set; }
        public bool LegalAprobada { get; set; }
        public bool ContratoFirmado { get; set; }
        public bool ComprobanteCargado { get; set; }
        public bool ConciliacionOK { get; set; }
        public int TareasPendientes { get; set; }
    }
}
