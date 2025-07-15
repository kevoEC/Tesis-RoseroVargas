// Controllers/Catalogos/TipoReferenciaController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TipoReferenciaController : ControllerBase
    {
        private readonly IRepository<TipoReferencia> _repo;

        /// <summary>
        /// Constructor del controlador de TipoReferencia.
        /// </summary>
        public TipoReferenciaController(IRepository<TipoReferencia> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los tipos de referencia.
        /// </summary>
        /// <returns>Lista de tipos de referencia.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoReferencia>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un tipo de referencia por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de referencia.</param>
        /// <returns>Tipo de referencia encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoReferencia>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo tipo de referencia.
        /// </summary>
        /// <param name="item">Objeto TipoReferencia a crear.</param>
        /// <returns>El tipo de referencia creado.</returns>
        [HttpPost]
        public async Task<ActionResult<TipoReferencia>> Post([FromBody] TipoReferencia item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdTipoReferencia }, item);
        }

        /// <summary>
        /// Actualiza un tipo de referencia existente.
        /// </summary>
        /// <param name="id">ID del tipo de referencia a actualizar.</param>
        /// <param name="item">Objeto TipoReferencia con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoReferencia item)
        {
            if (id != item.IdTipoReferencia)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de referencia por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de referencia a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
