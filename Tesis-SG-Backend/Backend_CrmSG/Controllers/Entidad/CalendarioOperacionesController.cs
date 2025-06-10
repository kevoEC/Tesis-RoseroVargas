using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;
using Backend_CrmSG.DTOs.CalendarioOperaciones;

namespace Backend_CrmSG.Controllers.Entidades
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalendarioOperacionesController : ControllerBase
    {
        private readonly IRepository<CalendarioOperaciones> _repo;

        public CalendarioOperacionesController(IRepository<CalendarioOperaciones> repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CalendarioOperaciones>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CalendarioOperaciones>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<CalendarioOperaciones>> Post([FromBody] CalendarioOperaciones item)
        {
            // Si quieres, aquí puedes setear la fecha/usuario creación por defecto:
            item.FechaCreacion = DateTime.Now;
            item.IdUsuarioCreacion = 3;
            item.IdUsuarioPropietario = 3;
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdCalendario }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CalendarioOperacionesUpdateDTO dto)
        {
            var original = await _repo.GetByIdAsync(id);
            if (original == null)
                return NotFound();

            // Solo actualiza los campos permitidos
            original.Nombre = dto.Nombre;
            original.FechaCorte = dto.FechaCorte;
            original.CalendarioInversiones = dto.CalendarioInversiones;
            original.FechaGenerarPagos = dto.FechaGenerarPagos;
            original.FechaEnvioEECC = dto.FechaEnvioEECC;
            original.EstadoProcesoPagos = dto.EstadoProcesoPagos;
            original.EstadoProcesoEnvioEECC = dto.EstadoProcesoEnvioEECC;
            original.EstadoCalendario = dto.EstadoCalendario;
            original.FechaModificacion = DateTime.Now;
            original.IdUsuarioModificacion = dto.IdUsuarioModificacion; // o el usuario autenticado

            await _repo.UpdateAsync(original);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
