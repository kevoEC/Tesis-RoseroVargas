using Backend_CrmSG.DTOs.Dashboard.Cliente;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controlador para consultar estadísticas y métricas agregadas de clientes para el dashboard.
/// </summary>
[ApiController]
[Route("api/dashboard/clientes")]
public class DashboardClienteController : ControllerBase
{
    private readonly DashboardClienteService _service;

    /// <summary>
    /// Constructor que inyecta el servicio de dashboard de clientes.
    /// </summary>
    /// <param name="service">Servicio especializado en estadísticas de clientes.</param>
    public DashboardClienteController(DashboardClienteService service)
    {
        _service = service;
    }

    /// <summary>
    /// Obtiene estadísticas agregadas de clientes, para su visualización en el dashboard.
    /// </summary>
    /// <returns>Datos estadísticos de clientes (totales, agrupaciones, etc).</returns>
    [HttpGet("estadisticas")]
    public async Task<ActionResult<EstadisticasClienteDTO>> GetEstadisticasClientes()
    {
        var data = await _service.GetEstadisticasClientesAsync();
        return Ok(data);
    }
}
