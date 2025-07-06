using Backend_CrmSG.DTOs.Dashboard.Solicitud;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend_CrmSG.Controllers.Dashboard
{
    [Route("api/dashboard/solicitudes")]
    [ApiController]
    public class DashboardSolicitudController : ControllerBase
    {
        private readonly DashboardSolicitudService _service;

        public DashboardSolicitudController(DashboardSolicitudService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene todas las estadísticas de solicitudes para el dashboard.
        /// </summary>
        [HttpGet("estadisticas")]
        public async Task<ActionResult<EstadisticasSolicitudDTO>> GetEstadisticasSolicitudes()
        {
            var data = await _service.GetEstadisticasSolicitudesAsync();
            return Ok(data);
        }
    }
}
