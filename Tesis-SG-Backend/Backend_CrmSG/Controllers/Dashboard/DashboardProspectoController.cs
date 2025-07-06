using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Services.Dashboard.Prospecto;
using Backend_CrmSG.DTOs.Dashboard.Prospecto;

namespace Backend_CrmSG.Controllers.Dashboard
{
    [ApiController]
    [Route("api/dashboard/prospectos")]
    public class DashboardProspectoController : ControllerBase
    {
        private readonly DashboardProspectoService _service;

        public DashboardProspectoController(DashboardProspectoService service)
        {
            _service = service;
        }

        // GET: api/dashboard/prospectos/estadisticas
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasProspectosDTO>> GetEstadisticasProspectos()
        {
            var data = await _service.GetEstadisticasProspectosAsync();
            return Ok(data);
        }
    }
}
