namespace Backend_CrmSG.Models.Vistas
{
    public class ConfiguracionProductoView
    {
        public int IdConfiguraciones { get; set; }
        public decimal MontoMinimo { get; set; }
        public decimal MontoMaximo { get; set; }
        public short Plazo { get; set; }
        public decimal Taza { get; set; }
        public decimal CosteOperativoEEUU { get; set; }
        public int IdOrigen { get; set; }
        public string OrigenNombre { get; set; } = string.Empty;
        public int IdProducto { get; set; }
        public string ProductoNombre { get; set; } = string.Empty;
        public int IdTipoTasa { get; set; }
        public string TipoTasaNombre { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public string UsuarioCreacion { get; set; } = string.Empty;
        public int? IdUsuarioModificacion { get; set; }
        public string? UsuarioModificacion { get; set; }
    }
}
