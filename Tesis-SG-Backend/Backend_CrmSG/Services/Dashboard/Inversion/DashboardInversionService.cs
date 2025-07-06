using Backend_CrmSG.DTOs.Dashboard.Inversion;
using Backend_CrmSG.Data;
using Microsoft.EntityFrameworkCore;

public class DashboardInversionService
{
    private readonly AppDbContext _context;

    public DashboardInversionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EstadisticasInversionDTO> GetEstadisticasInversionesAsync()
    {
        // 1. Total de Inversiones
        var totalInversiones = await _context.InversionDetalle.CountAsync();

        // 2. Total Capital Invertido (sumando todas las inversiones)
        var totalCapitalInvertido = await (
            from i in _context.InversionDetalle
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            select (double?)pr.Capital
        ).SumAsync() ?? 0;

        //3. Rentabilidad total (solo las no terminadas)
        var totalRentabilidad = await _context.InversionDetalle
            .Where(x => x.Terminada == false)
            .SumAsync(x => (double?)x.TotalRentabilidad) ?? 0;

        // 4. Inversiones por Producto
        var porProducto = await (
            from i in _context.InversionDetalle
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            join prod in _context.Producto on pr.IdProducto equals prod.IdProducto
            group pr by new { pr.IdProducto, prod.ProductoNombre } into g
            select new InversionesPorProductoDTO
            {
                IdProducto = g.Key.IdProducto,
                ProductoNombre = g.Key.ProductoNombre,
                TotalInversiones = g.Count(),
                CapitalInvertido = g.Sum(x => (double)x.Capital)
            }
        ).OrderByDescending(x => x.CapitalInvertido).ToListAsync();

        // 5. Inversiones captadas por mes
        // Si FechaCreacion NO es nullable, solo usa directamente:
        var porMes = await (
            from i in _context.InversionDetalle
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            group pr by new { Año = i.FechaCreacion.Year, Mes = i.FechaCreacion.Month } into g
            select new InversionesPorMesDTO
            {
                Año = g.Key.Año,
                Mes = g.Key.Mes,
                TotalInversiones = g.Count(),
                CapitalInvertido = g.Sum(x => (double)x.Capital)
            }
        ).OrderBy(x => x.Año).ThenBy(x => x.Mes).ToListAsync();


        // 6. Inversiones por tipo de cliente
        var porTipoCliente = await (
            from i in _context.InversionDetalle
            join c in _context.ClienteDetalle on i.IdCliente equals c.IdCliente
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            group pr by c.TipoCliente into g
            select new InversionesPorTipoClienteDTO
            {
                TipoCliente = g.Key ?? "No especificado",
                TotalInversiones = g.Count(),
                CapitalInvertido = g.Sum(x => (double)x.Capital)
            }
        ).OrderByDescending(x => x.TotalInversiones).ToListAsync();

        // 7. Inversiones activas vs. terminadas
        var porEstado = await (
            from i in _context.InversionDetalle
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            group pr by (i.Terminada ? "Terminada" : "Activa") into g
            select new InversionesPorEstadoDTO
            {
                EstadoInversion = g.Key,
                TotalInversiones = g.Count(),
                CapitalInvertido = g.Sum(x => (double)x.Capital)
            }
        ).ToListAsync();

        // 8. Rendimiento promedio (%) de las inversiones
        var rendimientoPromedio = await (
            from i in _context.InversionDetalle
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            select (double?)pr.Tasa
        ).AverageAsync() ?? 0;

        // 9. Inversiones por Plazo (meses)
        var porPlazo = await (
            from i in _context.InversionDetalle
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            group pr by pr.Plazo into g
            select new InversionesPorPlazoDTO
            {
                Plazo = g.Key,
                TotalInversiones = g.Count(),
                CapitalInvertido = g.Sum(x => (double)x.Capital)
            }
        ).OrderBy(x => x.Plazo).ToListAsync();

        // 10. Ranking de clientes por monto invertido
        var rankingClientes = await (
            from i in _context.InversionDetalle
            join c in _context.Cliente on i.IdCliente equals c.IdCliente
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            group pr by new { c.Nombres, c.ApellidoPaterno, c.ApellidoMaterno } into g
            select new RankingClienteInversionDTO
            {
                NombreCompleto = $"{g.Key.Nombres} {g.Key.ApellidoPaterno} {g.Key.ApellidoMaterno}".Trim(),
                MontoInvertido = g.Sum(x => (double)x.Capital),
                TotalInversiones = g.Count()
            }
        ).OrderByDescending(x => x.MontoInvertido).ToListAsync();

        // 11. Inversiones por país de residencia del cliente
        var porPais = await (
            from i in _context.InversionDetalle
            join c in _context.ClienteDetalle on i.IdCliente equals c.IdCliente
            join pr in _context.Proyeccion on i.IdProyeccion equals pr.IdProyeccion
            group pr by c.Pais into g
            select new InversionesPorPaisDTO
            {
                Pais = g.Key ?? "No especificado",
                TotalInversiones = g.Count(),
                CapitalInvertido = g.Sum(x => (double)x.Capital)
            }
        ).OrderByDescending(x => x.CapitalInvertido).ToListAsync();

        return new EstadisticasInversionDTO
        {
            TotalInversiones = totalInversiones,
            TotalCapitalInvertido = totalCapitalInvertido,
            TotalRentabilidad = totalRentabilidad,
            PorProducto = porProducto,
            PorMes = porMes,
            PorTipoCliente = porTipoCliente,
            PorEstado = porEstado,
            RendimientoPromedio = rendimientoPromedio,
            PorPlazo = porPlazo,
            RankingClientes = rankingClientes,
            PorPais = porPais
        };
    }
}
