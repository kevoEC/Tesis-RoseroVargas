namespace Backend_CrmSG.DTOs
{
    public class TareaUpdateDTO
    {
        public int IdResultado { get; set; }
        public string? Observación { get; set; }
        public string DatosEspecificos { get; set; } = string.Empty;
    }

}
