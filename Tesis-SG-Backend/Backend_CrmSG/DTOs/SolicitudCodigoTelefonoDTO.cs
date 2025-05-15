namespace Backend_CrmSG.DTOs
{
    public class SolicitudCodigoTelefonoDTO
    {
        public int IdUsuario { get; set; }
        public string Numero { get; set; } = null!;
        public string Extension { get; set; } = null!; // ej: +593
    }

}
