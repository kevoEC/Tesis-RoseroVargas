using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.DTOs.Caso;
using Backend_CrmSG.Services.Entidad.Caso;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CasosController : ControllerBase
    {
        private readonly ICasoService _service;

        public CasosController(ICasoService service)
        {
            _service = service;
        }

        // GET: api/Casos
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var lista = await _service.ObtenerTodosAsync();
            return Ok(lista);
        }

        // GET: api/Casos/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var caso = await _service.ObtenerPorIdAsync(id);
            if (caso == null)
                return NotFound();
            return Ok(caso);
        }

        // GET: api/Casos/por-cliente/{idCliente}
        [HttpGet("por-cliente/{idCliente}")]
        public async Task<IActionResult> GetPorCliente(int idCliente)
        {
            var casos = await _service.FiltrarPorClienteAsync(idCliente);
            return Ok(casos);
        }

        // GET: api/Casos/por-inversion/{idInversion}
        [HttpGet("por-inversion/{idInversion}")]
        public async Task<IActionResult> GetPorInversion(int idInversion)
        {
            var casos = await _service.FiltrarPorInversionAsync(idInversion);
            return Ok(casos);
        }

        // GET: api/Casos/por-pago/{idPago}
        [HttpGet("por-pago/{idPago}")]
        public async Task<IActionResult> GetPorPago(int idPago)
        {
            var casos = await _service.FiltrarPorPagoAsync(idPago);
            return Ok(casos);
        }

        // POST: api/Casos
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CasoCreateDTO dto)
        {
            var idCaso = await _service.CrearCasoAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = idCaso }, new { idCaso });
        }

        // PUT: api/Casos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CasoUpdateDTO dto)
        {
            await _service.ActualizarAsync(id, dto);
            return NoContent();
        }

        // POST: api/Casos/{id}/continuar
        [HttpPost("{id}/continuar")]
        public async Task<IActionResult> ContinuarCaso(int id)
        {
            await _service.ContinuarFlujoCasoAsync(id);
            return Ok(new { success = true });
        }

        // POST: api/Casos/rollback-pagos
        [HttpPost("rollback-pagos")]
        public async Task<IActionResult> RollbackPagos([FromBody] RollbackPagosDTO dto)
        {
            // dto debe tener { idPago, idUsuarioModificacion }
            await _service.RollbackPagosPorIdPagoAsync(dto.IdPago, dto.IdUsuarioModificacion);
            return Ok(new { success = true });
        }
    }

    // DTO auxiliar para rollback (puedes moverlo a la carpeta DTOs)
    public class RollbackPagosDTO
    {
        public int IdPago { get; set; }
        public int IdUsuarioModificacion { get; set; }
    }
}
