// Controllers/Catalogos/ProfesionController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfesionController : ControllerBase
    {
        private readonly IRepository<Profesion> _repo;

        /// <summary>
        /// Constructor del controlador de Profesión.
        /// </summary>
        public ProfesionController(IRepository<Profesion> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las profesiones registradas.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Profesion>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una profesión por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Profesion>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva profesión.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Profesion>> Post([FromBody] Profesion item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdProfesion }, item);
        }

        /// <summary>
        /// Actualiza una profesión existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Profesion item)
        {
            if (id != item.IdProfesion)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una profesión por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
