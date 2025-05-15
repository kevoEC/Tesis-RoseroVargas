namespace Backend_CrmSG.DTOs
{
    public class ResultadoEnvioSms
    {
        public bool Success { get; set; }
        public bool YaValidado { get; set; } = false;
        public string? Message { get; set; }
    }

}
