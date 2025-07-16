using Backend_CrmSG.DTOs.Dashboard.Tarea;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controlador para estadísticas y métricas de tareas en el dashboard.
/// </summary>
[ApiController]
[Route("api/dashboard/tareas")]
public class DashboardTareasController : ControllerBase
{
    private readonly DashboardTareasService _service;

    /// <summary>
    /// Constructor del controlador de dashboard de tareas.
    /// </summary>
    /// <param name="service">Servicio de estadísticas de tareas.</param>
    public DashboardTareasController(DashboardTareasService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene las estadísticas principales de tareas para el dashboard.
    /// </summary>
    /// <remarks>
    /// Devuelve métricas como cantidad total de tareas, tareas por estado, por usuario, y otros KPIs relevantes para el dashboard.
    /// </remarks>
    /// <returns>Objeto con estadísticas generales de tareas.</returns>
    /// <response code="200">Retorna el objeto con estadísticas de tareas.</response>
    [HttpGet("estadisticas")]
    public async Task<ActionResult<EstadisticasTareasDTO>> GetEstadisticasTareas()
    {
        var data = await _service.GetEstadisticasTareasAsync();
        return Ok(data);
    }
}
