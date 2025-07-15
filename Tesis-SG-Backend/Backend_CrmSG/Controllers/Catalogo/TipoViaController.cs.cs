// Controllers/Catalogos/TipoViaController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TipoViaController : ControllerBase
    {
        private readonly IRepository<TipoVia> _repo;

        /// <summary>
        /// Constructor del controlador de TipoVia.
        /// </summary>
        public TipoViaController(IRepository<TipoVia> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las opciones de TipoVia.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoVia>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una opción de TipoVia por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoVia>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva opción de TipoVia.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TipoVia>> Post([FromBody] TipoVia item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdTipoVia }, item);
        }

        /// <summary>
        /// Actualiza una opción de TipoVia existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoVia item)
        {
            if (id != item.IdTipoVia)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una opción de TipoVia por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
