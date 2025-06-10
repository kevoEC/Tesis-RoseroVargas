namespace Backend_CrmSG.DTOs.Caso
{
    public class CasoCreateDTO
    {
        public int IdCliente { get; set; }
        public int IdMotivo { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public int? IdInversion { get; set; }
        public int? IdPago { get; set; }
        public string? DatosEspecificos { get; set; } // Si no mandas, el backend la arma según el motivo
        public bool ContinuarCaso { get; set; } = false;
        public string Estado { get; set; } = "Iniciado";
        public int IdUsuarioCreacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
    }
}
