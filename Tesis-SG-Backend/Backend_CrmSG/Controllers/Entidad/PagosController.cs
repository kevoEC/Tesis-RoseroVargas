using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Services.Entidad.Pago;
using Backend_CrmSG.DTOs.Pago;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PagosController : ControllerBase
    {
        private readonly IPagoService _service;

        public PagosController(IPagoService service)
        {
            _service = service;
        }

        // GET: api/Pagos
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var lista = await _service.ObtenerTodosAsync();
            return Ok(lista);
        }

        // GET: api/Pagos/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var pago = await _service.ObtenerPorIdAsync(id);
            if (pago == null)
                return NotFound(new { success = false, message = "Pago no encontrado." });
            return Ok(pago);
        }

        // GET: api/Pagos/por-calendario/{idCalendario}
        [HttpGet("por-calendario/{idCalendario}")]
        public async Task<IActionResult> GetPorCalendario(int idCalendario)
        {
            var pagos = await _service.ObtenerPorCalendarioAsync(idCalendario);
            return Ok(pagos);
        }

        // POST: api/Pagos
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PagoCreateDTO dto)
        {
            var idPago = await _service.CrearAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = idPago }, new { idPago });
        }

        // PUT: api/Pagos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] PagoUpdateDTO dto)
        {
            await _service.ActualizarAsync(id, dto);
            return NoContent();
        }

        // DELETE: api/Pagos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.EliminarAsync(id);
            return NoContent();
        }

        // POST: api/Pagos/generar-por-calendario
        [HttpPost("generar-por-calendario")]
        public async Task<IActionResult> GenerarPorCalendario([FromBody] GenerarPagosCalendarioDTO dto)
        {
            await _service.GenerarPagosPorCalendarioAsync(dto.IdCalendario, dto.IdPago, dto.IdUsuario);
            return Ok(new { success = true, message = "Pagos generados automáticamente por calendario." });
        }

        [HttpPost("{id}/rollback")]
        public async Task<IActionResult> RollbackPagosPorIdPago(int id, [FromBody] RollbackUsuarioDto dto)
        {
            await _service.RollbackPagosPorIdPagoAsync(id, dto.IdUsuarioModificacion);
            return Ok(new { success = true, message = "Rollback realizado correctamente." });
        }

    }

    // DTO auxiliar para generación automática (puedes moverlo a DTOs si quieres)
    public class GenerarPagosCalendarioDTO
    {
        public int IdCalendario { get; set; }
        public int IdPago { get; set; }
        public int IdUsuario { get; set; }
    }

    public class RollbackUsuarioDto
    {
        public int IdUsuarioModificacion { get; set; }
    }

}
