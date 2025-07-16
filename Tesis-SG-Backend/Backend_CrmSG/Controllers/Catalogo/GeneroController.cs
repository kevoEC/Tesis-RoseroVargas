// Controllers/Catalogos/GeneroController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GeneroController : ControllerBase
    {
        private readonly IRepository<Genero> _repo;

        /// <summary>
        /// Constructor del controlador de Género.
        /// </summary>
        public GeneroController(IRepository<Genero> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los géneros.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Genero>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un género por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Genero>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo género.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Genero>> Post([FromBody] Genero item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdGenero }, item);
        }

        /// <summary>
        /// Actualiza un género existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Genero item)
        {
            if (id != item.IdGenero)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un género por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
