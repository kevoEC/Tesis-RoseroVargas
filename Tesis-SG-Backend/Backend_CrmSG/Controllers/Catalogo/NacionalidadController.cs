// Controllers/Catalogo/NacionalidadController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;
using Backend_CrmSG.Models.Catalogos;

namespace Backend_CrmSG.Controllers.Catalogo
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NacionalidadController : ControllerBase
    {
        private readonly IRepository<Nacionalidad> _repo;

        /// <summary>
        /// Constructor del controlador de Nacionalidad.
        /// </summary>
        public NacionalidadController(IRepository<Nacionalidad> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las nacionalidades disponibles.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Nacionalidad>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una nacionalidad por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Nacionalidad>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva nacionalidad.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Nacionalidad>> Post([FromBody] Nacionalidad item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdNacionalidad }, item);
        }

        /// <summary>
        /// Actualiza una nacionalidad existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Nacionalidad item)
        {
            if (id != item.IdNacionalidad)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una nacionalidad por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
