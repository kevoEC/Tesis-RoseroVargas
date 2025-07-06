namespace Backend_CrmSG.DTOs
{
    public class AdendumCreateDto
    {
        public int IdInversion { get; set; }
        public int? IdProyeccionOriginal { get; set; }
        public int? PeriodoIncremento { get; set; }
        public decimal? MontoIncremento { get; set; }
        public int IdUsuarioCreacion { get; set; }
    }

}
