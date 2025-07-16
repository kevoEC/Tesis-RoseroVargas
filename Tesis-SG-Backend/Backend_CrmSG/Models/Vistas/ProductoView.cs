// Models/Vistas/ProductoView.cs
namespace Backend_CrmSG.Models.Vistas
{
    public class ProductoView
    {
        public int IdProducto { get; set; }
        public string? ProductoNombre { get; set; }
        public string? NombreComercial { get; set; }
        public string? ProductoCodigo { get; set; }
        public string? Iniciales { get; set; }
        public short Periocidad { get; set; }
        public int IdFormaPago { get; set; }
        public string? FormaPagoNombre { get; set; }
        public string? Descripcion { get; set; }
        public decimal? MontoMinimoIncremento { get; set; }
        public decimal? Penalidad { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public string? UsuarioCreacionNombre { get; set; }
        public int? IdUsuarioModificacion { get; set; }
        public string? UsuarioModificacionNombre { get; set; }
    }

}
