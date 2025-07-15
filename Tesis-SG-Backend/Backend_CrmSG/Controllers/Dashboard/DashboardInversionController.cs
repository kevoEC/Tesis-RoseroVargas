using Backend_CrmSG.DTOs.Dashboard.Inversion;
using Backend_CrmSG.Services.Dashboard;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Dashboard
{
    /// <summary>
    /// Controlador de métricas y estadísticas agregadas de inversiones para el dashboard.
    /// </summary>
    [ApiController]
    [Route("api/dashboard/inversiones")]
    public class DashboardInversionController : ControllerBase
    {
        private readonly DashboardInversionService _service;

        /// <summary>
        /// Inyecta el servicio que obtiene las estadísticas de inversiones.
        /// </summary>
        /// <param name="service">Servicio especializado en dashboard de inversiones.</param>
        public DashboardInversionController(DashboardInversionService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene estadísticas agregadas de inversiones para visualización en el dashboard.
        /// </summary>
        /// <remarks>
        /// Devuelve totales, agrupaciones y otros KPIs relevantes de inversiones.
        /// </remarks>
        /// <returns>Un objeto con datos estadísticos agregados de inversiones.</returns>
        /// <response code="200">Devuelve el objeto con los datos estadísticos</response>
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasInversionDTO>> GetEstadisticasInversiones()
        {
            var data = await _service.GetEstadisticasInversionesAsync();
            return Ok(data);
        }
    }
}
