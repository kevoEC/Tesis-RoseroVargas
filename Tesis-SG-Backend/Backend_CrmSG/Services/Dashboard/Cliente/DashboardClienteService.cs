using Backend_CrmSG.DTOs.Dashboard.Cliente;
using Backend_CrmSG.Data;
using Microsoft.EntityFrameworkCore;

public class DashboardClienteService
{
    private readonly AppDbContext _context;
    public DashboardClienteService(AppDbContext context) => _context = context;

    public async Task<EstadisticasClienteDTO> GetEstadisticasClientesAsync()
    {
        // 1. Total Clientes
        int totalClientes = await _context.Cliente.CountAsync();

        // 2. Clientes captados por mes
        var porMes = await _context.Cliente
            .GroupBy(x => new { Año = x.FechaCreacion.Year, Mes = x.FechaCreacion.Month })
            .Select(g => new ClientesPorMesDTO
            {
                Año = g.Key.Año,
                Mes = g.Key.Mes,
                TotalClientes = g.Count()
            })
            .OrderBy(x => x.Año)
            .ThenBy(x => x.Mes)
            .ToListAsync();


        // 3. Clientes por género
        var porGenero = await _context.ClienteDetalle
            .GroupBy(x => x.Genero ?? "No especificado")
            .Select(g => new ClientesPorGeneroDTO { Genero = g.Key, Total = g.Count() })
            .ToListAsync();

        // 4. Clientes por tipo de cliente
        var porTipoCliente = await _context.ClienteDetalle
            .GroupBy(x => x.TipoCliente ?? "No especificado")
            .Select(g => new ClientesPorTipoDTO { TipoCliente = g.Key, Total = g.Count() })
            .ToListAsync();

        // 5. Clientes por tipo de identificación
        var porTipoIdentificacion = await _context.ClienteDetalle
            .GroupBy(x => x.TipoIdentificacion ?? "No especificado")
            .Select(g => new ClientesPorIdentificacionDTO { TipoIdentificacion = g.Key, Total = g.Count() })
            .ToListAsync();

        // 6. Total PEP
        int totalPEP = await _context.ClienteDetalle.CountAsync(x => x.EsPEP == true);

        // 7. Total Residentes en el exterior
        int totalResidentesExterior = await _context.ClienteDetalle.CountAsync(x => x.ResidenteOtroPais == true);

        // 8. Clientes por edad (rangos)
        var hoy = DateTime.Today;
        var porEdad = await _context.Cliente
            .Select(x => new
            {
                Edad = hoy.Year - x.FechaNacimiento.Year - (hoy < x.FechaNacimiento.AddYears(hoy.Year - x.FechaNacimiento.Year) ? 1 : 0)
            })
            .GroupBy(x => x.Edad < 18 ? "Menor de 18" :
                            x.Edad < 30 ? "18-29" :
                            x.Edad < 45 ? "30-44" :
                            x.Edad < 60 ? "45-59" : "60 o más")
            .Select(g => new ClientesPorEdadDTO { RangoEdad = g.Key, Total = g.Count() })
            .OrderBy(x => x.RangoEdad)
            .ToListAsync();


        // 9. Clientes con cuenta bancaria en el exterior
        int totalCtasExterior = await _context.ClienteDetalle.CountAsync(x => x.Pais != null && x.Pais != "Ecuador");

        // 10. Clientes contribuyentes EEUU
        int totalContribuyentesEEUU = await _context.ClienteDetalle.CountAsync(x => x.ContribuyenteEEUU == true);

        // 11. Clientes por país de residencia
        var porPais = await _context.ClienteDetalle
            .GroupBy(x => x.Pais ?? "No especificado")
            .Select(g => new ClientesPorPaisDTO { Pais = g.Key, TotalClientes = g.Count() })
            .OrderByDescending(x => x.TotalClientes)
            .ToListAsync();

        // 12. Clientes por nacionalidad
        var porNacionalidad = await _context.ClienteDetalle
            .GroupBy(x => x.Nacionalidad ?? "No especificado")
            .Select(g => new ClientesPorNacionalidadDTO { Nacionalidad = g.Key, TotalClientes = g.Count() })
            .OrderByDescending(x => x.TotalClientes)
            .ToListAsync();

        return new EstadisticasClienteDTO
        {
            TotalClientes = totalClientes,
            PorMes = porMes,
            PorGenero = porGenero,
            PorTipoCliente = porTipoCliente,
            PorTipoIdentificacion = porTipoIdentificacion,
            TotalPEP = totalPEP,
            TotalResidentesExterior = totalResidentesExterior,
            PorEdad = porEdad,
            TotalCtasExterior = totalCtasExterior,
            TotalContribuyentesEEUU = totalContribuyentesEEUU,
            PorPais = porPais,
            PorNacionalidad = porNacionalidad
        };
    }
}
