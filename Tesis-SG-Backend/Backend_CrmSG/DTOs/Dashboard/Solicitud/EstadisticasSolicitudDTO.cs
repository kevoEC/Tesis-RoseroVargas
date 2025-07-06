namespace Backend_CrmSG.DTOs.Dashboard.Solicitud
{
    public class EstadisticasSolicitudDTO
    {
        public List<SolicitudesPorEstadoDTO> PorEstado { get; set; } = new();
        public int TotalCompletadas { get; set; }
        public double PorcentajeConversion { get; set; }
        public List<SolicitudProspectoEstadoDTO> EstadoPorProspecto { get; set; } = new();
        public List<SolicitudesPorMesDTO> PorMes { get; set; } = new();
        public int SolicitudesConProyeccion { get; set; }
        public List<SolicitudProyeccionDetalleDTO> SolicitudesConProyeccionDetalle { get; set; } = new();
        public KPIFinancieroSolicitudesDTO? KPIFinanciero { get; set; }
        public List<SolicitudProyeccionPorProductoDTO> ProyeccionesPorProducto { get; set; } = new();
        public int SolicitudesConProyeccionTotal { get; set; }
        public int SolicitudesSinProyeccionTotal { get; set; }
    }
}
