// Controllers/Catalogos/EtniaController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EtniaController : ControllerBase
    {
        private readonly IRepository<Etnia> _repo;

        public EtniaController(IRepository<Etnia> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las etnias.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Etnia>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una etnia por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Etnia>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva etnia.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Etnia>> Post([FromBody] Etnia item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdEtnia }, item);
        }

        /// <summary>
        /// Actualiza una etnia existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Etnia item)
        {
            if (id != item.IdEtnia)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una etnia por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
