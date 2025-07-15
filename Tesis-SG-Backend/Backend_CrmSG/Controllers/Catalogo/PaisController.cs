// Controllers/Catalogos/PaisController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaisController : ControllerBase
    {
        private readonly IRepository<Pais> _repo;

        /// <summary>
        /// Constructor del controlador de País.
        /// </summary>
        public PaisController(IRepository<Pais> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los países registrados.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pais>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un país por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Pais>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo país.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Pais>> Post([FromBody] Pais item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdPais }, item);
        }

        /// <summary>
        /// Actualiza un país existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Pais item)
        {
            if (id != item.IdPais)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un país por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
