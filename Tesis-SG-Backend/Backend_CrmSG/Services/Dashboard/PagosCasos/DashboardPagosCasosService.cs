using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs.Dashboard.PagosCasos;
using Microsoft.EntityFrameworkCore;

public class DashboardPagosCasosService
{
    private readonly AppDbContext _context;

    public DashboardPagosCasosService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EstadisticasPagosCasosDTO> GetEstadisticasAsync()
    {
        // 1. Pagos por calendario
        var pagosPorCalendario = await _context.CalendarioOperaciones
            .Select(c => new PagosPorCalendarioDTO
            {
                IdCalendario = c.IdCalendario,
                NombreCalendario = c.Nombre ?? "",
                FechaCorte = c.FechaCorte,
                TotalPagos = _context.Pago.Count(p => p.IdCalendario == c.IdCalendario)
            })
            .OrderByDescending(x => x.FechaCorte)
            .ToListAsync();

        // 2. Pagos confirmados y descartados por calendario
        var pagosConfirmadosDescartados = await _context.CalendarioOperaciones
            .Select(c => new PagosConfirmadosDescartadosDTO
            {
                IdCalendario = c.IdCalendario,
                NombreCalendario = c.Nombre ?? "",
                FechaCorte = c.FechaCorte,
                PagosConfirmados = _context.Pago.Count(p => p.IdCalendario == c.IdCalendario && p.ConfirmarRegistrosPagos == true),
                PagosDescartados = _context.Pago.Count(p => p.IdCalendario == c.IdCalendario && p.DescartarPagos == true)
            })
            .OrderByDescending(x => x.FechaCorte)
            .ToListAsync();

        // 3. Casos por motivo
        var casosPorMotivo = await _context.CasosDetalleExtendida
            .GroupBy(x => x.MotivoNombre)
            .Select(g => new CasosPorMotivoDTO
            {
                MotivoNombre = g.Key ?? "",
                TotalCasos = g.Count()
            })
            .OrderByDescending(x => x.TotalCasos)
            .ToListAsync();

        // 4. Pagos automáticos vs manuales
        var pagosPorMotivo = await _context.CasosDetalleExtendida
            .Where(x => x.MotivoNombre == "Pago" || x.MotivoNombre == "Pago manual")
            .GroupBy(x => x.MotivoNombre)
            .Select(g => new PagosPorMotivoDTO
            {
                MotivoNombre = g.Key ?? "",
                TotalPagos = g.Count(),
                MontoTotal = g.Sum(x => (double)(x.MontoPago ?? 0))
            })
            .ToListAsync();

        // 5. Estado de casos de pago
        var estadoCasosPago = await _context.CasosDetalleExtendida
            .Where(x => x.MotivoNombre == "Pago" || x.MotivoNombre == "Pago manual")
            .GroupBy(x => new { x.MotivoNombre, x.Estado })
            .Select(g => new EstadoCasosPagoDTO
            {
                MotivoNombre = g.Key.MotivoNombre ?? "",
                Estado = g.Key.Estado ?? "",
                TotalCasos = g.Count()
            })
            .OrderBy(x => x.MotivoNombre).ThenBy(x => x.Estado)
            .ToListAsync();

        // 6. Pagos generados en el último calendario operativo (mes actual)
        var hoy = DateTime.Today;
        var pagosUltimoCalendario = await (
            from p in _context.Pago
            join c in _context.CalendarioOperaciones on p.IdCalendario equals c.IdCalendario
            where c.FechaCorte.Month == hoy.Month && c.FechaCorte.Year == hoy.Year
            group p by c.Nombre into g
            select new PagosUltimoCalendarioDTO
            {
                NombreCalendario = g.Key ?? "",
                TotalPagos = g.Count()
            }
        ).ToListAsync();

        // 7. Casos de terminación de contrato
#pragma warning disable CS8602 // Desreferencia de una referencia posiblemente NULL.
        var casosTerminacion = await _context.CasosDetalleExtendida
            .Where(x => x.MotivoNombre.Contains("terminación"))
            .GroupBy(x => x.MotivoNombre)
            .Select(g => new CasosTerminacionDTO
            {
                MotivoNombre = g.Key ?? "",
                TotalCasos = g.Count()
            })
            .ToListAsync();
#pragma warning restore CS8602 // Desreferencia de una referencia posiblemente NULL.

        // 8. Monto total pagado por calendario (casos cerrados)
        var montoPagadoPorCalendario = await (
            from ce in _context.CasosDetalleExtendida
            join p in _context.Pago on ce.IdPago equals p.IdPago
            join c in _context.CalendarioOperaciones on p.IdCalendario equals c.IdCalendario
            where ce.Estado == "Cerrado" && ce.MontoPago != null
            group ce by new { c.Nombre, c.FechaCorte } into g
            select new MontoPagadoPorCalendarioDTO
            {
                NombreCalendario = g.Key.Nombre ?? "",
                FechaCorte = g.Key.FechaCorte,
                MontoTotalPagado = g.Sum(x => (double)(x.MontoPago ?? 0))
            }
        ).OrderByDescending(x => x.FechaCorte).ToListAsync();

        // 9. Pagos pendientes por cliente
        var pagosPendientesPorCliente = await _context.CasosDetalleExtendida
            .Where(x => x.Estado == "Iniciado" && (x.MotivoNombre == "Pago" || x.MotivoNombre == "Pago manual"))
            .GroupBy(x => x.NombreCliente)
            .Select(g => new PagosPendientesClienteDTO
            {
                NombreCliente = g.Key ?? "",
                PagosPendientes = g.Count(),
                MontoPendiente = g.Sum(x => (double)(x.MontoPago ?? 0))
            })
            .OrderByDescending(x => x.MontoPendiente)
            .ToListAsync();

        // 10. Casos creados por usuario
        var casosPorUsuario = await _context.CasosDetalleExtendida
            .GroupBy(x => x.NombreUsuarioCreacion)
            .Select(g => new CasosPorUsuarioDTO
            {
                NombreUsuarioCreacion = g.Key ?? "",
                TotalCasos = g.Count()
            })
            .OrderByDescending(x => x.TotalCasos)
            .ToListAsync();

        return new EstadisticasPagosCasosDTO
        {
            PagosPorCalendario = pagosPorCalendario,
            PagosConfirmadosDescartados = pagosConfirmadosDescartados,
            CasosPorMotivo = casosPorMotivo,
            PagosPorMotivo = pagosPorMotivo,
            EstadoCasosPago = estadoCasosPago,
            PagosUltimoCalendario = pagosUltimoCalendario,
            CasosTerminacion = casosTerminacion,
            MontoPagadoPorCalendario = montoPagadoPorCalendario,
            PagosPendientesPorCliente = pagosPendientesPorCliente,
            CasosPorUsuario = casosPorUsuario
        };
    }
}
