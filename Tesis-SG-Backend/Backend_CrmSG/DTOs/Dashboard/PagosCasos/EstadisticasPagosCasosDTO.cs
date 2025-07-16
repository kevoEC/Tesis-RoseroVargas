namespace Backend_CrmSG.DTOs.Dashboard.PagosCasos
{
    public class EstadisticasPagosCasosDTO
    {
        public List<PagosPorCalendarioDTO> PagosPorCalendario { get; set; } = new();
        public List<PagosConfirmadosDescartadosDTO> PagosConfirmadosDescartados { get; set; } = new();
        public List<CasosPorMotivoDTO> CasosPorMotivo { get; set; } = new();
        public List<PagosPorMotivoDTO> PagosPorMotivo { get; set; } = new();
        public List<EstadoCasosPagoDTO> EstadoCasosPago { get; set; } = new();
        public List<PagosUltimoCalendarioDTO> PagosUltimoCalendario { get; set; } = new();
        public List<CasosTerminacionDTO> CasosTerminacion { get; set; } = new();
        public List<MontoPagadoPorCalendarioDTO> MontoPagadoPorCalendario { get; set; } = new();
        public List<PagosPendientesClienteDTO> PagosPendientesPorCliente { get; set; } = new();
        public List<CasosPorUsuarioDTO> CasosPorUsuario { get; set; } = new();
    }

    // Sub-DTOs
    public class PagosPorCalendarioDTO
    {
        public int IdCalendario { get; set; }
        public string NombreCalendario { get; set; } = "";
        public DateTime FechaCorte { get; set; }
        public int TotalPagos { get; set; }
    }

    public class PagosConfirmadosDescartadosDTO
    {
        public int IdCalendario { get; set; }
        public string NombreCalendario { get; set; } = "";
        public DateTime FechaCorte { get; set; }
        public int PagosConfirmados { get; set; }
        public int PagosDescartados { get; set; }
    }

    public class CasosPorMotivoDTO
    {
        public string MotivoNombre { get; set; } = "";
        public int TotalCasos { get; set; }
    }

    public class PagosPorMotivoDTO
    {
        public string MotivoNombre { get; set; } = "";
        public int TotalPagos { get; set; }
        public double MontoTotal { get; set; }
    }

    public class EstadoCasosPagoDTO
    {
        public string MotivoNombre { get; set; } = "";
        public string Estado { get; set; } = "";
        public int TotalCasos { get; set; }
    }

    public class PagosUltimoCalendarioDTO
    {
        public string NombreCalendario { get; set; } = "";
        public int TotalPagos { get; set; }
    }

    public class CasosTerminacionDTO
    {
        public string MotivoNombre { get; set; } = "";
        public int TotalCasos { get; set; }
    }

    public class MontoPagadoPorCalendarioDTO
    {
        public string NombreCalendario { get; set; } = "";
        public DateTime FechaCorte { get; set; }
        public double MontoTotalPagado { get; set; }
    }

    public class PagosPendientesClienteDTO
    {
        public string NombreCliente { get; set; } = "";
        public int PagosPendientes { get; set; }
        public double MontoPendiente { get; set; }
    }

    public class CasosPorUsuarioDTO
    {
        public string NombreUsuarioCreacion { get; set; } = "";
        public int TotalCasos { get; set; }
    }

}
