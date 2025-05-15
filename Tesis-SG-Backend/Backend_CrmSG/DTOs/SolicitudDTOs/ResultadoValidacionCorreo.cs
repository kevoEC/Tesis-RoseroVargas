namespace Backend_CrmSG.DTOs.SolicitudDTOs
{
    public class ResultadoValidacionCorreo
    {
        public bool Exitoso { get; set; }
        public bool YaValidado { get; set; }
        public string? Mensaje { get; set; }
    }

}
