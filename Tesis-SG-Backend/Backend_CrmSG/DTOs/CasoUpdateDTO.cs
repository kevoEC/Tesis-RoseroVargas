namespace Backend_CrmSG.DTOs.Caso
{
    public class CasoUpdateDTO
    {
        public string Descripcion { get; set; } = string.Empty;
        public bool ContinuarCaso { get; set; }
        public string Estado { get; set; } = "Iniciado";
        public int IdUsuarioModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public string? DatosEspecificos { get; set; }
        // NO incluye: IdCliente, IdMotivo, IdInversion, IdPago, NumeroCaso, FechaCreacion, IdUsuarioCreacion
    }
}
