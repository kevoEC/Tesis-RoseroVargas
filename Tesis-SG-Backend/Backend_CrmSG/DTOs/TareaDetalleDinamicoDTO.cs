namespace Backend_CrmSG.DTOs
{
    public class TareaDetalleDinamicoDTO
    {
        public int IdTarea { get; set; }
        public string TareaNombre { get; set; } = string.Empty;
        public string NombreTipoTarea { get; set; } = string.Empty;
        public int IdTipoTarea { get; set; }
        public int IdResultado { get; set; }
        public string? Observacion { get; set; }

        // Campos dinámicos
        public Dictionary<string, object?> CamposTipo { get; set; } = new();
    }

}
