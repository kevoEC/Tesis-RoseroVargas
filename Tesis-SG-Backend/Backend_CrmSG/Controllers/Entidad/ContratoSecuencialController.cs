using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controlador para la generación de números de contrato secuenciales.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ContratoSecuencialController : ControllerBase
{
    private readonly ContratoSecuencialService _service;

    /// <summary>
    /// Constructor del controlador de contratos secuenciales.
    /// </summary>
    /// <param name="service">Servicio de lógica para generación de contratos secuenciales.</param>
    public ContratoSecuencialController(ContratoSecuencialService service)
    {
        _service = service;
    }

    /// <summary>
    /// Genera y obtiene el número secuencial de contrato para una solicitud y proyección dadas.
    /// </summary>
    /// <param name="solicitud">Identificador de la solicitud de inversión.</param>
    /// <param name="proyeccion">Identificador de la proyección asociada.</param>
    /// <returns>Número de contrato generado, o error si no se pudo generar.</returns>
    /// <response code="200">Número de contrato generado correctamente.</response>
    /// <response code="400">No se pudo generar el número de contrato.</response>
    [HttpGet("generar")]
    public async Task<IActionResult> GenerarContrato([FromQuery] int solicitud, [FromQuery] int proyeccion)
    {
        var numeroContrato = await _service.GenerarObtenerNumeroContratoAsync(solicitud, proyeccion);
        if (string.IsNullOrWhiteSpace(numeroContrato))
            return BadRequest("No se pudo generar el número de contrato.");
        return Ok(new { numeroContrato });
    }
}
