using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Validaciones;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Validacion
{
    /// <summary>
    /// Controlador para la validación de usuarios contra servicios externos como Equifax y LDS.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Puedes comentar esto si estás en pruebas locales
    public class ValidacionController : ControllerBase
    {
        private readonly IValidacionService _validacionService;

        /// <summary>
        /// Constructor para inyección de dependencias.
        /// </summary>
        public ValidacionController(IValidacionService validacionService)
        {
            _validacionService = validacionService;
        }

        /// <summary>
        /// Realiza la validación de un usuario/persona a través del servicio Equifax.
        /// </summary>
        /// <param name="dto">Datos requeridos para la consulta Equifax.</param>
        /// <returns>
        /// Objeto con el resultado de la validación. Si hay error, retorna un mensaje explicativo.
        /// </returns>
        /// <response code="200">Retorna el resultado de la validación Equifax.</response>
        /// <response code="400">Si ocurre un error en la validación Equifax.</response>
        [HttpPost("equifax")]
        public async Task<IActionResult> ValidarEquifax([FromBody] EquifaxRequestDto dto)
        {
            try
            {
                var resultado = await _validacionService.ValidarEquifaxAsync(dto);
                return Ok(new
                {
                    success = true,
                    resultado
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Error en la validación Equifax",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Realiza la validación de un usuario/persona a través del servicio LDS.
        /// </summary>
        /// <param name="dto">Datos requeridos para la consulta LDS.</param>
        /// <returns>
        /// Objeto con el resultado de la validación. Si hay error, retorna un mensaje explicativo.
        /// </returns>
        /// <response code="200">Retorna el resultado de la validación LDS.</response>
        /// <response code="400">Si ocurre un error en la validación LDS.</response>
        [HttpPost("lds")]
        public async Task<IActionResult> ValidarLds([FromBody] LdsRequestDto dto)
        {
            try
            {
                var resultado = await _validacionService.ValidarLdsAsync(dto);
                return Ok(new
                {
                    success = true,
                    resultado
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Error en la validación LDS",
                    details = ex.Message
                });
            }
        }
    }
}
