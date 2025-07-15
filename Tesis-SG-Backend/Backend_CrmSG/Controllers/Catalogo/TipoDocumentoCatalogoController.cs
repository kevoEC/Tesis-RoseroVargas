// Controllers/Catalogos/TipoDocumentoCatalogoController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TipoDocumentoCatalogoController : ControllerBase
    {
        private readonly IRepository<TipoDocumentoCatalogo> _repo;

        /// <summary>
        /// Constructor del controlador de TipoDocumentoCatalogo.
        /// </summary>
        public TipoDocumentoCatalogoController(IRepository<TipoDocumentoCatalogo> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los tipos de documento catalogados.
        /// </summary>
        /// <returns>Lista de tipos de documento.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoDocumentoCatalogo>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un tipo de documento catalogado por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de documento.</param>
        /// <returns>Tipo de documento encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoDocumentoCatalogo>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo tipo de documento catalogado.
        /// </summary>
        /// <param name="item">Objeto TipoDocumentoCatalogo a crear.</param>
        /// <returns>El tipo de documento creado.</returns>
        [HttpPost]
        public async Task<ActionResult<TipoDocumentoCatalogo>> Post([FromBody] TipoDocumentoCatalogo item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdTipoDocumento }, item);
        }

        /// <summary>
        /// Actualiza un tipo de documento catalogado existente.
        /// </summary>
        /// <param name="id">ID del tipo de documento a actualizar.</param>
        /// <param name="item">Objeto TipoDocumentoCatalogo con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoDocumentoCatalogo item)
        {
            if (id != item.IdTipoDocumento)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de documento catalogado por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de documento a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
