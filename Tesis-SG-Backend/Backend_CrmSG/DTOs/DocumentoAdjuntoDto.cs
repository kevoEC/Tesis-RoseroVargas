namespace Backend_CrmSG.DTOs
{
    public class DocumentoAdjuntoDto
    {
        public int IdDocumento { get; set; }
        public int IdTipoDocumento { get; set; }
        public string? TipoDocumentoNombre { get; set; }
        public string? CodigoTipoDocumento { get; set; }
        public byte[]? Archivo { get; set; } // tipo binario directo
        public int? IdMotivo { get; set; }
        public string? MotivoNombre { get; set; }
        public int? IdTarea { get; set; }
        public int? IdSolicitudInversion { get; set; }
        public int? IdInversion { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public bool? PermitirDuplicados { get; set; }
        public bool? CopiarInversion { get; set; }
        public int? IdTipoArchivo { get; set; }
    }
}
