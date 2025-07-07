public class TareaDetalleDinamicoDTO
{
    public int IdTarea { get; set; }
    public string TareaNombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty; // <-- Nuevo campo
    public string NombreTipoTarea { get; set; } = string.Empty;
    public int IdTipoTarea { get; set; }
    public int IdResultado { get; set; }
    public string? NombreResultado { get; set; } // <-- Útil para mostrar el badge/candado
    public string? Observacion { get; set; }
    public int IdUsuarioCreacion { get; set; }
    public string? NombreUsuarioCreacion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public int? IdUsuarioModificacion { get; set; }
    public string? NombreUsuarioModificacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public int IdUsuarioPropietario { get; set; }
    public string? NombreUsuarioPropietario { get; set; }
    public Dictionary<string, object?> CamposTipo { get; set; } = new();
    public int IdSolicitudInversion { get; set; }

}
