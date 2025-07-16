using Backend_CrmSG.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Documento
{
    /// <summary>
    /// Controlador para la generación automática de contratos en base a una solicitud de inversión.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContratoController : ControllerBase
    {
        private readonly GeneradorContratoService _service;

        /// <summary>
        /// Constructor que inyecta el servicio generador de contratos.
        /// </summary>
        /// <param name="service">Servicio encargado de la lógica de generación de contratos.</param>
        public ContratoController(GeneradorContratoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Genera automáticamente el contrato principal a partir de una solicitud de inversión.
        /// </summary>
        /// <param name="dto">Objeto con el identificador de la solicitud de inversión.</param>
        /// <returns>
        /// Devuelve un objeto con el resultado de la operación y un mensaje explicativo.
        /// </returns>
        /// <response code="200">Si el contrato se generó exitosamente.</response>
        /// <response code="500">Si ocurre un error interno durante la generación.</response>
        [HttpPost("generar-por-solicitud")]
        public async Task<IActionResult> GenerarContrato([FromBody] GenerarContratoRequest dto)
        {
            try
            {
                var resultado = await _service.GenerarContratoDesdeSolicitudAsync(dto.IdSolicitudInversion);
                return Ok(new
                {
                    success = resultado,
                    message = resultado ? "Contrato generado correctamente." : "No se pudo generar el contrato."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error al generar el contrato.",
                    details = ex.Message
                });
            }
        }
    }
}
