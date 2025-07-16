using Backend_CrmSG.DTOs.Dashboard.Solicitud;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend_CrmSG.Controllers.Dashboard
{
    /// <summary>
    /// Controlador para obtener estadísticas y KPIs de solicitudes de inversión en el dashboard.
    /// </summary>
    [Route("api/dashboard/solicitudes")]
    [ApiController]
    public class DashboardSolicitudController : ControllerBase
    {
        private readonly DashboardSolicitudService _service;

        /// <summary>
        /// Constructor del controlador de dashboard de solicitudes.
        /// </summary>
        /// <param name="service">Servicio de métricas de solicitudes.</param>
        public DashboardSolicitudController(DashboardSolicitudService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene todas las estadísticas de solicitudes para el dashboard.
        /// </summary>
        /// <remarks>
        /// Este endpoint retorna los principales indicadores relacionados a solicitudes de inversión, como cantidad total, por estado, por producto, y otros datos relevantes para el dashboard.
        /// </remarks>
        /// <returns>Objeto con las métricas y estadísticas principales de solicitudes.</returns>
        /// <response code="200">Retorna el objeto con las estadísticas de solicitudes</response>
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasSolicitudDTO>> GetEstadisticasSolicitudes()
        {
            var data = await _service.GetEstadisticasSolicitudesAsync();
            return Ok(data);
        }
    }
}
