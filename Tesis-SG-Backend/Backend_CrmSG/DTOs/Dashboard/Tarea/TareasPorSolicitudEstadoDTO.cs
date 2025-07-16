namespace Backend_CrmSG.DTOs.Dashboard.Tarea
{
    public class TareasPorSolicitudEstadoDTO
    {
        public int IdSolicitudInversion { get; set; }
        public int IdTipoTarea { get; set; }
        public string NombreTipoTarea { get; set; } = "";
        public int IdResultado { get; set; }
        public string NombreResultado { get; set; } = "";
        public int Total { get; set; }
    }
}
