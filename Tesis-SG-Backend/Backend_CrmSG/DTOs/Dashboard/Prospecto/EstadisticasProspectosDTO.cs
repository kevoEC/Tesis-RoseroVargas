namespace Backend_CrmSG.DTOs.Dashboard.Prospecto
{
    public class EstadisticasProspectosDTO
    {
        public int Activos { get; set; }
        public int Inactivos { get; set; }
        public int Convertidos { get; set; }
        public int NoConvertidos { get; set; }
        public double PorcentajeConversion { get; set; }
        public List<ProspectosPorProductoDTO>? PorProductoInteres { get; set; }
        public List<ProspectosPorOrigenDTO>? PorOrigen { get; set; }
        public List<ProspectosPorMesDTO>? PorMes { get; set; }
        public int ProspectosConSolicitud { get; set; }
        public int ProspectosSinSolicitud { get; set; }
    }
}
