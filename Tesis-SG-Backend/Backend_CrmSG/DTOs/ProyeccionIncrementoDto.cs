namespace Backend_CrmSG.DTOs
{
    public class ProyeccionIncrementoDto
    {
        public int IdProyeccionOriginal { get; set; }
        public int PeriodoIncremento { get; set; }
        public decimal MontoIncremento { get; set; }
        public int IdUsuario { get; set; }
    }

}
