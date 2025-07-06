using Backend_CrmSG.DTOs.Dashboard.Cliente;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/dashboard/clientes")]
public class DashboardClienteController : ControllerBase
{
    private readonly DashboardClienteService _service;
    public DashboardClienteController(DashboardClienteService service)
    {
        _service = service;
    }

    [HttpGet("estadisticas")]
    public async Task<ActionResult<EstadisticasClienteDTO>> GetEstadisticasClientes()
    {
        var data = await _service.GetEstadisticasClientesAsync();
        return Ok(data);
    }
}
