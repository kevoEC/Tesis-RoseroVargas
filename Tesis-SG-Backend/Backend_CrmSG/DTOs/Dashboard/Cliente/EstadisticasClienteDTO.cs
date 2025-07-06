namespace Backend_CrmSG.DTOs.Dashboard.Cliente
{
    public class EstadisticasClienteDTO
    {
        public int TotalClientes { get; set; }
        public List<ClientesPorMesDTO> PorMes { get; set; } = [];
        public List<ClientesPorGeneroDTO> PorGenero { get; set; } = [];
        public List<ClientesPorTipoDTO> PorTipoCliente { get; set; } = [];
        public List<ClientesPorIdentificacionDTO> PorTipoIdentificacion { get; set; } = [];
        public int TotalPEP { get; set; }
        public int TotalResidentesExterior { get; set; }
        public List<ClientesPorEdadDTO> PorEdad { get; set; } = [];
        public int TotalCtasExterior { get; set; }
        public int TotalContribuyentesEEUU { get; set; }
        public List<ClientesPorPaisDTO> PorPais { get; set; } = [];
        public List<ClientesPorNacionalidadDTO> PorNacionalidad { get; set; } = [];
    }

    public class ClientesPorMesDTO { public int Año { get; set; } public int Mes { get; set; } public int TotalClientes { get; set; } }
    public class ClientesPorGeneroDTO { public string Genero { get; set; } = ""; public int Total { get; set; } }
    public class ClientesPorTipoDTO { public string TipoCliente { get; set; } = ""; public int Total { get; set; } }
    public class ClientesPorIdentificacionDTO { public string TipoIdentificacion { get; set; } = ""; public int Total { get; set; } }
    public class ClientesPorEdadDTO { public string RangoEdad { get; set; } = ""; public int Total { get; set; } }
    public class ClientesPorPaisDTO { public string Pais { get; set; } = ""; public int TotalClientes { get; set; } }
    public class ClientesPorNacionalidadDTO { public string Nacionalidad { get; set; } = ""; public int TotalClientes { get; set; } }


}
