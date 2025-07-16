using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de tareas dentro del sistema.
    /// Permite consultar, filtrar y actualizar tareas.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TareaController : ControllerBase
    {
        private readonly ITareaService _tareaService;

        /// <summary>
        /// Constructor del controlador de tareas.
        /// </summary>
        public TareaController(ITareaService tareaService)
        {
            _tareaService = tareaService;
        }

        /// <summary>
        /// Obtiene todas las tareas existentes en el sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> ObtenerTodas()
        {
            var tareas = await _tareaService.ObtenerTodas();
            return Ok(tareas);
        }

        /// <summary>
        /// Obtiene las tareas asignadas a un rol específico.
        /// </summary>
        /// <param name="idRol">Identificador del rol.</param>
        [HttpGet("por-rol/{idRol}")]
        public async Task<IActionResult> ObtenerPorRol(int idRol)
        {
            var tareas = await _tareaService.ObtenerPorRol(idRol);
            return Ok(tareas);
        }

        /// <summary>
        /// Obtiene las tareas asociadas a una solicitud de inversión específica.
        /// </summary>
        /// <param name="idSolicitud">Identificador de la solicitud de inversión.</param>
        [HttpGet("por-solicitud/{idSolicitud}")]
        public async Task<IActionResult> ObtenerPorSolicitud(int idSolicitud)
        {
            var tareas = await _tareaService.ObtenerPorSolicitudAsync(idSolicitud);
            return Ok(new { success = true, data = tareas });
        }

        /// <summary>
        /// Obtiene el detalle de una tarea específica por su identificador.
        /// </summary>
        /// <param name="id">Identificador de la tarea.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerDetallePorId(int id)
        {
            var tarea = await _tareaService.ObtenerDetallePorId(id);
            if (tarea == null)
                return NotFound(new { success = false, message = "Tarea no encontrada" });

            return Ok(new { success = true, data = tarea });
        }

        /// <summary>
        /// Actualiza dinámicamente una tarea existente, permitiendo modificar campos flexibles.
        /// El usuario autenticado es tomado del token JWT.
        /// </summary>
        /// <param name="id">Identificador de la tarea a actualizar.</param>
        /// <param name="dto">DTO con los datos de actualización.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Actualizar(int id, [FromBody] TareaUpdateDinamicoDTO dto)
        {
            try
            {
                var idClaim = User.Claims.FirstOrDefault(c => c.Type == "idUsuario");
                if (idClaim == null)
                    return Unauthorized(new { success = false, message = "Token no contiene el idUsuario." });

                var idUsuario = int.Parse(idClaim.Value);

                await _tareaService.ActualizarDinamico(id, dto, idUsuario);
                return Ok(new { success = true, message = "Tarea actualizada correctamente." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error al actualizar tarea.", error = ex.Message });
            }
        }
    }
}
