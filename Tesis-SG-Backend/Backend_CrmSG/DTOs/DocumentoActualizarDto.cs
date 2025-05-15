namespace Backend_CrmSG.DTOs
{
    public class DocumentoActualizarDto
    {
        public string Base64Contenido { get; set; } = string.Empty;
        public string? Observaciones { get; set; }
    }
}
