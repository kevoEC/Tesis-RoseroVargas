using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Documentos
{
    public class Documento
    {
        [Key]
        public int IdDocumento { get; set; }
        public int? IdTipoDocumento { get; set; }
        public string? DocumentoNombre { get; set; }
        public byte[]? Archivo { get; set; }
        public int? IdTarea { get; set; }
        public int? IdSolicitudInversion { get; set; }
        public int? IdInversion { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public bool Activo { get; set; }
        public string? Observaciones { get; set; }
        public int? IdAdendum { get; set; }
    }
}
