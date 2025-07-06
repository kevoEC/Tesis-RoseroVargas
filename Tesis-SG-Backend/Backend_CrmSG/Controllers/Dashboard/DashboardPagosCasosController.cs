using Backend_CrmSG.DTOs.Dashboard.PagosCasos;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Dashboard
{
    [ApiController]
    [Route("api/dashboard/pagos-casos")]
    public class DashboardPagosCasosController : ControllerBase
    {
        private readonly DashboardPagosCasosService _service;

        public DashboardPagosCasosController(DashboardPagosCasosService service)
        {
            _service = service;
        }

        // GET: api/dashboard/pagos-casos/estadisticas
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasPagosCasosDTO>> GetEstadisticasPagosCasos()
        {
            var data = await _service.GetEstadisticasAsync();
            return Ok(data);
        }
    }
}
