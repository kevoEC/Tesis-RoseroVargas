namespace Backend_CrmSG.DTOs.Dashboard.Solicitud
{
    public class SolicitudProyeccionPorProductoDTO
    {
        public int IdProducto { get; set; }
        public string ProductoNombre { get; set; } = "";
        public int TotalProyecciones { get; set; }
        public double CapitalTotal { get; set; }
    }
}
