using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TareaController : ControllerBase
    {
        private readonly ITareaService _tareaService;

        public TareaController(ITareaService tareaService)
        {
            _tareaService = tareaService;
        }

        // GET: api/tarea
        [HttpGet]
        public async Task<IActionResult> ObtenerTodas()
        {
            var tareas = await _tareaService.ObtenerTodas();
            return Ok(tareas);
        }

        // GET: api/tarea/por-rol/{idRol}
        [HttpGet("por-rol/{idRol}")]
        public async Task<IActionResult> ObtenerPorRol(int idRol)
        {
            var tareas = await _tareaService.ObtenerPorRol(idRol);
            return Ok(tareas);
        }

        // GET: api/tarea/por-solicitud/{idSolicitud}
        [HttpGet("por-solicitud/{idSolicitud}")]
        public async Task<IActionResult> ObtenerPorSolicitud(int idSolicitud)
        {
            var tareas = await _tareaService.ObtenerPorSolicitudAsync(idSolicitud);
            return Ok(new { success = true, data = tareas });
        }

        // GET: api/tarea/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerDetallePorId(int id)
        {
            var tarea = await _tareaService.ObtenerDetallePorId(id);
            if (tarea == null)
                return NotFound(new { success = false, message = "Tarea no encontrada" });

            return Ok(new { success = true, data = tarea });
        }

        // PUT: api/tarea/{id}
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
