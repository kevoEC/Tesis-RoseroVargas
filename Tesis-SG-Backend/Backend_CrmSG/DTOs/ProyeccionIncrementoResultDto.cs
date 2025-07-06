namespace Backend_CrmSG.DTOs
{
    namespace Backend_CrmSG.DTOs
    {
        public class ProyeccionIncrementoResultDto
        {
            public int IdProyeccionNueva { get; set; }
            public int IdCronogramaProyeccionNueva { get; set; }
            public required ProyeccionDetalleDto Proyeccion { get; set; }
            public required List<CronogramaCuotaDto> Cronograma { get; set; }
        }
    }

}
