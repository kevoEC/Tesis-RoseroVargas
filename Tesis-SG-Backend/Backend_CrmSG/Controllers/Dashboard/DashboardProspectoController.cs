using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Services.Dashboard.Prospecto;
using Backend_CrmSG.DTOs.Dashboard.Prospecto;

namespace Backend_CrmSG.Controllers.Dashboard
{
    /// <summary>
    /// Controlador para estadísticas y KPIs de prospectos en el dashboard.
    /// </summary>
    [ApiController]
    [Route("api/dashboard/prospectos")]
    public class DashboardProspectoController : ControllerBase
    {
        private readonly DashboardProspectoService _service;

        /// <summary>
        /// Constructor del controlador de dashboard de prospectos.
        /// </summary>
        /// <param name="service">Servicio de métricas de prospectos.</param>
        public DashboardProspectoController(DashboardProspectoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene las estadísticas y métricas principales de prospectos para el dashboard.
        /// </summary>
        /// <remarks>
        /// Devuelve los principales indicadores sobre prospectos, como cantidad por estado, por origen, embudo comercial, etc.
        /// </remarks>
        /// <returns>Objeto con los datos estadísticos de prospectos.</returns>
        /// <response code="200">Devuelve el objeto con las métricas principales</response>
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasProspectosDTO>> GetEstadisticasProspectos()
        {
            var data = await _service.GetEstadisticasProspectosAsync();
            return Ok(data);
        }
    }
}
