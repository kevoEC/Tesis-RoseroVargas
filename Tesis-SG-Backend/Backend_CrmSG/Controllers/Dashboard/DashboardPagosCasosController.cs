using Backend_CrmSG.DTOs.Dashboard.PagosCasos;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Dashboard
{
    /// <summary>
    /// Controlador para la obtención de métricas y estadísticas relacionadas a pagos y casos en el dashboard.
    /// </summary>
    [ApiController]
    [Route("api/dashboard/pagos-casos")]
    public class DashboardPagosCasosController : ControllerBase
    {
        private readonly DashboardPagosCasosService _service;

        /// <summary>
        /// Constructor del controlador de dashboard de pagos y casos.
        /// </summary>
        /// <param name="service">Servicio que gestiona las métricas de pagos y casos.</param>
        public DashboardPagosCasosController(DashboardPagosCasosService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene las estadísticas agregadas de pagos y casos para el dashboard.
        /// </summary>
        /// <remarks>
        /// Devuelve un objeto con los principales indicadores (KPIs) sobre pagos y casos, agrupados y listos para visualización.
        /// </remarks>
        /// <returns>Objeto con las métricas principales de pagos y casos.</returns>
        /// <response code="200">Devuelve el objeto con los datos estadísticos</response>
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasPagosCasosDTO>> GetEstadisticasPagosCasos()
        {
            var data = await _service.GetEstadisticasAsync();
            return Ok(data);
        }
    }
}
