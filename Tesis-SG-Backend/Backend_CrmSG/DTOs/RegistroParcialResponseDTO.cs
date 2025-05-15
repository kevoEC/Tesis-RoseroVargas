namespace Backend_CrmSG.DTOs
{
    namespace Backend_CrmSG.DTOs.Seguridad
    {
        public class RegistroParcialResponseDTO
        {
            public int IdUsuario { get; set; }
            public string HashValidacion { get; set; } = null!;
            public string Email { get; set; } = null!;
        }
    }

}
