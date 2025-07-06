namespace Backend_CrmSG.DTOs.ProductoCatalogo
{
    public class ProductoCatalogoCreateDTO
    {
        public required string ProductoNombre { get; set; }
        public required string NombreComercial { get; set; }
        public required string ProductoCodigo { get; set; }
        public required string Iniciales { get; set; }
        public int Periocidad { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public int IdFormaPago { get; set; }
        public required string Descripcion { get; set; }
        public decimal MontoMinimoIncremento { get; set; }
        public decimal Penalidad { get; set; }
    }
}
