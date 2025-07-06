using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ContratoSecuencialController : ControllerBase
{
    private readonly ContratoSecuencialService _service;

    public ContratoSecuencialController(ContratoSecuencialService service)
    {
        _service = service;
    }

    [HttpGet("generar")]
    public async Task<IActionResult> GenerarContrato([FromQuery] int solicitud, [FromQuery] int proyeccion)
    {
        var numeroContrato = await _service.GenerarObtenerNumeroContratoAsync(solicitud, proyeccion);
        if (string.IsNullOrWhiteSpace(numeroContrato))
            return BadRequest("No se pudo generar el número de contrato.");
        return Ok(new { numeroContrato });
    }
}
