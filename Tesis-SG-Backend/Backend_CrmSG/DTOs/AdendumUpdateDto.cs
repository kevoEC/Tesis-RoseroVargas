namespace Backend_CrmSG.DTOs
{
    public class AdendumUpdateDto
    {
        public int IdAdendum { get; set; }
        public int? Estado { get; set; } // Solo si va a cambiar estado
        public bool? GenerarDocumentos { get; set; }
        public bool? ContinuarFlujo { get; set; }
        public int? IdUsuarioModificacion { get; set; }

    }

}
