using Backend_CrmSG.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Documento
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContratoController : ControllerBase
    {
        private readonly GeneradorContratoService _service;

        public ContratoController(GeneradorContratoService service)
        {
            _service = service;
        }

        [HttpPost("generar-por-solicitud")]
        public async Task<IActionResult> GenerarContrato([FromBody] GenerarContratoRequest dto)
        {
            try
            {
                var resultado = await _service.GenerarContratoDesdeTareaAsync(dto.IdSolicitudInversion);
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
