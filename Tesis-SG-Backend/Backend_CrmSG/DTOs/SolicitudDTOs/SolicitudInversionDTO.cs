using Backend_CrmSG.DTOs.Solicitudes;

namespace Backend_CrmSG.DTOs.SolicitudDTOs
{
    public class SolicitudInversionDTO
    {
        public int IdSolicitudInversion { get; set; }
        public int? FaseProceso { get; set; } // 1: Llenado, 2: Tareas, 3: Rechazada, 4: Completada
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
        public string? JSONDocument { get; set; }

        public int? IdProspecto { get; set; }
        public string? NombreCompletoProspecto { get; set; }

        public int? IdCliente { get; set; }
        public string? NombreCompletoCliente { get; set; }

        public int? IdUsuarioPropietario { get; set; }
        public string? NombrePropietario { get; set; }

        public int? IdUsuarioModificacion { get; set; }
        public string? NombreModificacion { get; set; }


        public IdentificacionDTO? Identificacion { get; set; }
        public ProyeccionDTO? Proyeccion { get; set; }
        public DatosGeneralesDTO? DatosGenerales { get; set; }
        public ActividadEconomicaDTO? ActividadEconomica { get; set; }
        public DatosEconomicosDTO? DatosEconomicos { get; set; }
        public ContactoUbicacionDTO? ContactoUbicacion { get; set; }
        public BancoDTO? Banco { get; set; }
        public FinalizacionDTO? Finalizacion { get; set; }
        public AdjuntosDTO? Adjuntos { get; set; }
    }

}
