using Backend_CrmSG.DTOs.Dashboard.Tarea;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/dashboard/tareas")]
public class DashboardTareasController : ControllerBase
{
    private readonly DashboardTareasService _service;

    public DashboardTareasController(DashboardTareasService service)
    {
        _service = service;
    }

    [HttpGet("estadisticas")]
    public async Task<ActionResult<EstadisticasTareasDTO>> GetEstadisticasTareas()
    {
        var data = await _service.GetEstadisticasTareasAsync();
        return Ok(data);
    }
}
