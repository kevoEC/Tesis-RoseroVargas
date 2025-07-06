namespace Backend_CrmSG.DTOs.Dashboard.Inversion
{
    public class EstadisticasInversionDTO
    {
        public int TotalInversiones { get; set; }
        public double TotalCapitalInvertido { get; set; }
        public double TotalRentabilidad { get; set; }
        public List<InversionesPorProductoDTO>? PorProducto { get; set; }
        public List<InversionesPorMesDTO>? PorMes { get; set; }
        public List<InversionesPorTipoClienteDTO>? PorTipoCliente { get; set; }
        public List<InversionesPorEstadoDTO>? PorEstado { get; set; }
        public double RendimientoPromedio { get; set; }
        public List<InversionesPorPlazoDTO>? PorPlazo { get; set; }
        public List<RankingClienteInversionDTO>? RankingClientes { get; set; }
        public List<InversionesPorPaisDTO>? PorPais { get; set; }
    }

    // Por Producto de Inversión
    public class InversionesPorProductoDTO
    {
        public int IdProducto { get; set; }
        public string? ProductoNombre { get; set; }
        public int TotalInversiones { get; set; }
        public double CapitalInvertido { get; set; }
    }

    // Inversiones captadas por mes
    public class InversionesPorMesDTO
    {
        public int Año { get; set; }
        public int Mes { get; set; }
        public int TotalInversiones { get; set; }
        public double CapitalInvertido { get; set; }
    }

    // Por tipo de cliente
    public class InversionesPorTipoClienteDTO
    {
        public string? TipoCliente { get; set; }
        public int TotalInversiones { get; set; }
        public double CapitalInvertido { get; set; }
    }

    // Activas vs Terminadas
    public class InversionesPorEstadoDTO
    {
        public string? EstadoInversion { get; set; }
        public int TotalInversiones { get; set; }
        public double CapitalInvertido { get; set; }
    }

    // Por plazo (meses)
    public class InversionesPorPlazoDTO
    {
        public int? Plazo { get; set; }
        public int TotalInversiones { get; set; }
        public double CapitalInvertido { get; set; }
    }

    // Ranking de clientes por monto invertido
    public class RankingClienteInversionDTO
    {
        public string? NombreCompleto { get; set; }
        public double MontoInvertido { get; set; }
        public int TotalInversiones { get; set; }
    }

    // Por país de residencia
    public class InversionesPorPaisDTO
    {
        public string? Pais { get; set; }
        public int TotalInversiones { get; set; }
        public double CapitalInvertido { get; set; }
    }

}
