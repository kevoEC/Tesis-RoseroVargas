using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs.Dashboard.Tarea;
using Microsoft.EntityFrameworkCore;

public class DashboardTareasService
{
    private readonly AppDbContext _context;

    public DashboardTareasService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EstadisticasTareasDTO> GetEstadisticasTareasAsync()
    {
        // 1. Conteo de Tareas por Solicitud y Estado
        var conteoPorSolicitudEstado = await _context.TareasDetalle
            .GroupBy(t => new { t.IdSolicitudInversion, t.IdTipoTarea, t.NombreTipoTarea, t.IdResultado, t.NombreResultado })
            .Select(g => new TareasPorSolicitudEstadoDTO
            {
                IdSolicitudInversion = g.Key.IdSolicitudInversion,
                IdTipoTarea = g.Key.IdTipoTarea,
                NombreTipoTarea = g.Key.NombreTipoTarea ?? "",
                IdResultado = g.Key.IdResultado,
                NombreResultado = g.Key.NombreResultado ?? "",
                Total = g.Count()
            })
            .OrderBy(x => x.IdSolicitudInversion).ThenBy(x => x.IdTipoTarea).ThenBy(x => x.IdResultado)
            .ToListAsync();


        // 2. Matriz Global de Tareas por Tipo y Estado (para todos)
        var matrizGlobalPorTipoEstado = await _context.TareasDetalle
            .GroupBy(t => new { t.IdTipoTarea, t.NombreTipoTarea, t.IdResultado, t.NombreResultado })
            .Select(g => new TareasPorTipoEstadoGlobalDTO
            {
                IdTipoTarea = g.Key.IdTipoTarea,                       // << elimina el ?? 0
                NombreTipoTarea = g.Key.NombreTipoTarea ?? "",         // << solo si string?
                IdResultado = g.Key.IdResultado,                       // << elimina el ?? 0
                NombreResultado = g.Key.NombreResultado ?? "",         // << solo si string?
                Total = g.Count()
            })
            .OrderBy(x => x.IdTipoTarea).ThenBy(x => x.IdResultado)
            .ToListAsync();


        // 3. ¿Cuántas tareas faltan por aprobar por solicitud?
        var pendientesPorSolicitud = await _context.TareasDetalle
            .Where(t => t.IdResultado != 1)
            .GroupBy(t => t.IdSolicitudInversion)
            .Select(g => new TareasPendientesPorSolicitudDTO
            {
                IdSolicitudInversion = g.Key,
                TareasPendientes = g.Count()
            })
            .OrderByDescending(x => x.TareasPendientes)
            .ToListAsync();

        // 4. ¿Cuántos contratos ya están firmados por gerencia?
        var contratosFirmados = await _context.TareasDetalle
            .CountAsync(t => t.IdTipoTarea == 3 && t.FirmadoGerencia == true && t.IdResultado == 1);

        // 5. Reporte por Solicitud: Matriz de cumplimiento
        var reporteCumplimiento = await _context.TareasDetalle
            .GroupBy(t => t.IdSolicitudInversion)
            .Select(g => new ReporteCumplimientoSolicitudDTO
            {
                IdSolicitudInversion = g.Key,
                DocAprobada = g.Any(x => x.IdTipoTarea == 1 && x.IdResultado == 1),
                LegalAprobada = g.Any(x => x.IdTipoTarea == 2 && x.IdResultado == 1),
                ContratoFirmado = g.Any(x => x.IdTipoTarea == 3 && x.FirmadoGerencia == true && x.IdResultado == 1),
                ComprobanteCargado = g.Any(x => x.IdTipoTarea == 4 && x.IdResultado == 1),
                ConciliacionOK = g.Any(x => x.IdTipoTarea == 5 && x.IdResultado == 1),
                TareasPendientes = g.Count(x => x.IdResultado != 1)
            })
            .OrderBy(x => x.IdSolicitudInversion)
            .ToListAsync();

        // 6. Ejemplo: Cuántas tareas de cada tipo están pendientes globalmente
        var pendientesPorTipoGlobal = await _context.TareasDetalle
            .Where(t => t.IdResultado != 1)
            .GroupBy(t => new { t.IdTipoTarea, t.NombreTipoTarea })
            .Select(g => new TareasPendientesGlobalDTO
            {
                IdTipoTarea = g.Key.IdTipoTarea,
                NombreTipoTarea = g.Key.NombreTipoTarea ?? "",
                TotalPendientes = g.Count()
            })
            .OrderBy(x => x.IdTipoTarea)
            .ToListAsync();

        // Retornar todo junto
        return new EstadisticasTareasDTO
        {
            ConteoPorSolicitudEstado = conteoPorSolicitudEstado,
            MatrizGlobalPorTipoEstado = matrizGlobalPorTipoEstado,
            PendientesPorSolicitud = pendientesPorSolicitud,
            ContratosFirmados = contratosFirmados,
            ReporteCumplimiento = reporteCumplimiento,
            PendientesPorTipoGlobal = pendientesPorTipoGlobal
        };
    }
}
