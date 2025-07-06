using Backend_CrmSG.DTOs.Dashboard.Inversion;
using Backend_CrmSG.Services.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Dashboard
{
    [ApiController]
    [Route("api/dashboard/inversiones")]
    public class DashboardInversionController : ControllerBase
    {
        private readonly DashboardInversionService _service;

        public DashboardInversionController(DashboardInversionService service)
        {
            _service = service;
        }

        // GET: api/dashboard/inversiones/estadisticas
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasInversionDTO>> GetEstadisticasInversiones()
        {
            var data = await _service.GetEstadisticasInversionesAsync();
            return Ok(data);
        }
    }
}
