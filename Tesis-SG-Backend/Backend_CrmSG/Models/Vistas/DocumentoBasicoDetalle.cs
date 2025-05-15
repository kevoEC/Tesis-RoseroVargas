namespace Backend_CrmSG.Models.Vistas
{
    public class DocumentoBasicoDetalle
    {
        public int IdDocumento { get; set; }
        public string DocumentoNombre { get; set; } = string.Empty;
        public byte[]? Archivo { get; set; } // tipo binario directo
        public int? IdTarea { get; set; }
        public int? IdSolicitudInversion { get; set; }
        public int? IdInversion { get; set; }

        public string? Observaciones { get; set; }
        public bool Activo { get; set; }
    }
}
