namespace Backend_CrmSG.Models.Vistas
{
    public class TareaDetalle
    {
        public int IdTarea { get; set; }
        public string TareaNombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int IdResultado { get; set; }
        public string NombreResultado { get; set; } = string.Empty;
        public string? Observación { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public string NombreUsuarioCreacion { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public string? NombreUsuarioModificacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
        public string NombreUsuarioPropietario { get; set; } = string.Empty;
        public string DatosEspecificos { get; set; } = string.Empty;
        public int IdTipoTarea { get; set; }
        public string NombreTipoTarea { get; set; } = string.Empty;
        public int IdSolicitudInversion { get; set; }
    }

}
