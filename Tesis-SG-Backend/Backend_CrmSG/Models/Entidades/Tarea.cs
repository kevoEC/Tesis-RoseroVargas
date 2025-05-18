using System.ComponentModel.DataAnnotations;

public class Tarea
{
    [Key]
    public int IdTarea { get; set; }
    public string TareaNombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int IdResultado { get; set; }
    public string? Observación { get; set; }
    public int IdUsuarioCreacion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public int? IdUsuarioModificacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public int IdUsuarioPropietario { get; set; }
    public string DatosEspecificos { get; set; } = string.Empty;
    public int IdTipoTarea { get; set; }
    public int IdSolicitudInversion { get; set; }
}
