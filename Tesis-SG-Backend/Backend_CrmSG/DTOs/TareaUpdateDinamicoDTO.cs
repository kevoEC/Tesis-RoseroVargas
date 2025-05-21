namespace Backend_CrmSG.DTOs
{
    public class TareaUpdateDinamicoDTO
    {
        public int IdResultado { get; set; }
        public string? Observacion { get; set; }
        public Dictionary<string, object?> CamposTipo { get; set; } = new();
    }

}

