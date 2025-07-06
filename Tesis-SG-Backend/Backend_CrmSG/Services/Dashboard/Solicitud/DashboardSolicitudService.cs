using Backend_CrmSG.DTOs.Dashboard.Solicitud;
using Backend_CrmSG.Data;
using Microsoft.EntityFrameworkCore;

public class DashboardSolicitudService
{
    private readonly AppDbContext _context;

    public DashboardSolicitudService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EstadisticasSolicitudDTO> GetEstadisticasSolicitudesAsync()
    {
        // 1. Total de Solicitudes por Estado del Proceso
        var porEstado = await _context.SolicitudInversion
            .GroupBy(x => x.FaseProceso)
            .Select(g => new SolicitudesPorEstadoDTO
            {
                Estado = g.Key == 1 ? "Llenado de Información" :
                         g.Key == 2 ? "Tareas Generadas" :
                         g.Key == 3 ? "Rechazada" :
                         g.Key == 4 ? "Completada" : "Otro",
                TotalSolicitudes = g.Count()
            }).ToListAsync();

        // 2. Solicitudes Completadas
        var totalCompletadas = await _context.SolicitudInversion.CountAsync(x => x.FaseProceso == 4);

        // 3. Porcentaje de Conversión a Cliente
        var totalSolicitudes = await _context.SolicitudInversion.CountAsync();
        var porcentajeConversion = totalSolicitudes == 0 ? 0 :
            (totalCompletadas * 100.0 / totalSolicitudes);

        // 4. Detalle de prospectos y su estado de solicitud
        var estadoPorProspecto = await _context.Prospecto
            .GroupJoin(_context.SolicitudInversion,
                p => p.IdProspecto,
                s => s.IdProspecto,
                (p, solicitudes) => new SolicitudProspectoEstadoDTO
                {
                    IdProspecto = p.IdProspecto,
                    Nombres = p.Nombres,
                    ApellidoPaterno = p.ApellidoPaterno,
                    UltimoEstadoSolicitud = solicitudes.Max(s => (int?)s.FaseProceso)
                })
            .ToListAsync();

        // 5. Solicitudes por mes
        var porMes = await _context.SolicitudInversion
            .Where(x => x.FechaCreacion.HasValue)
            .GroupBy(x => new { Año = x.FechaCreacion!.Value.Year, Mes = x.FechaCreacion!.Value.Month })
            .Select(g => new SolicitudesPorMesDTO
            {
                Año = g.Key.Año,
                Mes = g.Key.Mes,
                TotalSolicitudes = g.Count()
            }).OrderBy(x => x.Año).ThenBy(x => x.Mes)
            .ToListAsync();

        // 6. Solicitudes con proyección asociada
        var solicitudesConProyeccion = await _context.SolicitudInversion
            .FromSqlRaw(@"SELECT * FROM SolicitudInversion WHERE JSON_VALUE(JSONDocument, '$.proyeccion.idProyeccionSeleccionada') IS NOT NULL")
            .CountAsync();

        // 7. Listado de solicitudes y proyección asociada (fuera de EF, en memoria)
        var solicitudesConProyeccionList = await _context.SolicitudInversion
            .FromSqlRaw(@"SELECT * FROM SolicitudInversion WHERE JSON_VALUE(JSONDocument, '$.proyeccion.idProyeccionSeleccionada') IS NOT NULL")
            .ToListAsync();

        var solicitudesConProyeccionDetalle = solicitudesConProyeccionList
            .Select(s => {
                try
                {
                    var json = Newtonsoft.Json.Linq.JObject.Parse(s.JSONDocument ?? "");
                    var idProy = json["proyeccion"]?["idProyeccionSeleccionada"]?.ToObject<int?>();

                    if (idProy == null)
                        return null;

                    var proy = _context.Proyeccion.FirstOrDefault(p => p.IdProyeccion == idProy);
                    if (proy == null)
                        return null;

                    return new SolicitudProyeccionDetalleDTO
                    {
                        IdSolicitudInversion = s.IdSolicitudInversion,
                        IdProyeccion = proy.IdProyeccion,
                        ProyeccionNombre = proy.ProyeccionNombre,
                        Plazo = proy.Plazo,
                        Tasa = (double?)proy.Tasa,
                        Capital = (double?)proy.Capital,
                        FaseProceso = s.FaseProceso ?? 0
                    };
                }
                catch { return null; }
            })
            .Where(x => x != null)
            .ToList();



        // 8. KPIs financieros agregados de solicitudes
        var proyeccionIds = await _context.SolicitudInversion
            .FromSqlRaw(@"SELECT * FROM SolicitudInversion WHERE JSON_VALUE(JSONDocument, '$.proyeccion.idProyeccionSeleccionada') IS NOT NULL")
            .Select(x => EF.Property<string>(x, "JSONDocument"))
            .ToListAsync();

        var proyeccionIdInts = proyeccionIds
            .Select(json =>
            {
                try
                {
                    var id = Newtonsoft.Json.Linq.JObject.Parse(json)?["proyeccion"]?["idProyeccionSeleccionada"]?.ToString();
                    return int.TryParse(id, out var val) ? val : 0;
                }
                catch { return 0; }
            })
            .Where(x => x > 0)
            .Distinct()
            .ToList();


        var kpiFinanciero = await _context.Proyeccion
            .Where(p => proyeccionIdInts.Contains(p.IdProyeccion))
            .GroupBy(_ => 1)
            .Select(g => new KPIFinancieroSolicitudesDTO
            {
                CapitalTotal = (double)g.Sum(p => p.Capital),
                TasaPromedio = (double)g.Average(p => p.Tasa),
                PlazoPromedio = g.Average(p => (double)p.Plazo),
                TotalProyecciones = g.Count()
            }).FirstOrDefaultAsync() ?? new KPIFinancieroSolicitudesDTO();


        // 9. Proyecciones por producto
        var proyeccionesPorProducto = await (
            from p in _context.Proyeccion
            join pr in _context.Producto on p.IdProducto equals pr.IdProducto
            where proyeccionIdInts.Contains(p.IdProyeccion)
            group new { p, pr } by new { p.IdProducto, pr.ProductoNombre } into g
            select new SolicitudProyeccionPorProductoDTO
            {
                IdProducto = g.Key.IdProducto,
                ProductoNombre = g.Key.ProductoNombre,
                TotalProyecciones = g.Count(),
                CapitalTotal = (double)g.Sum(x => x.p.Capital)
            }).ToListAsync();

        // 10. Extra: solicitudes con/sin proyección
        var conProyeccion = proyeccionIdInts.Count;


        var sinProyeccion = totalSolicitudes - conProyeccion;


#pragma warning disable CS8619 // La nulabilidad de los tipos de referencia del valor no coincide con el tipo de destino
        return new EstadisticasSolicitudDTO
        {
            PorEstado = porEstado,
            TotalCompletadas = totalCompletadas,
            PorcentajeConversion = porcentajeConversion,
            EstadoPorProspecto = estadoPorProspecto,
            PorMes = porMes,
            SolicitudesConProyeccion = solicitudesConProyeccion,
            SolicitudesConProyeccionDetalle = solicitudesConProyeccionDetalle,
            KPIFinanciero = kpiFinanciero,
            ProyeccionesPorProducto = proyeccionesPorProducto,
            SolicitudesConProyeccionTotal = conProyeccion,
            SolicitudesSinProyeccionTotal = sinProyeccion
        };
#pragma warning restore CS8619 // La nulabilidad de los tipos de referencia del valor no coincide con el tipo de destino
    }
}
