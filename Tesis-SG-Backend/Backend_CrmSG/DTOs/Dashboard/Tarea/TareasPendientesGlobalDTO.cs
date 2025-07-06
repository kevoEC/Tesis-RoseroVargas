namespace Backend_CrmSG.DTOs.Dashboard.Tarea
{
    public class TareasPendientesGlobalDTO
    {
        public int IdTipoTarea { get; set; }
        public string NombreTipoTarea { get; set; } = "";
        public int TotalPendientes { get; set; }
    }
}
