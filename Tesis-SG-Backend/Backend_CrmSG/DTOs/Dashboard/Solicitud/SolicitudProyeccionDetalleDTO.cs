namespace Backend_CrmSG.DTOs.Dashboard.Solicitud
{
    public class SolicitudProyeccionDetalleDTO
    {
        public int IdSolicitudInversion { get; set; }
        public int IdProyeccion { get; set; }
        public string ProyeccionNombre { get; set; } = "";
        public int? Plazo { get; set; }
        public double? Tasa { get; set; }
        public double? Capital { get; set; }
        public int FaseProceso { get; set; }
    }
}
