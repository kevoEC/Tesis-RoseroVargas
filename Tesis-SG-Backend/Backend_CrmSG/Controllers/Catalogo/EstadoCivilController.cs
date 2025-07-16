// Controllers/Catalogo/EstadoCivilController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogo
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EstadoCivilController : ControllerBase
    {
        private readonly IRepository<EstadoCivil> _repo;

        /// <summary>
        /// Constructor del controlador de EstadoCivil.
        /// </summary>
        public EstadoCivilController(IRepository<EstadoCivil> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los estados civiles.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EstadoCivil>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un estado civil por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EstadoCivil>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo estado civil.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EstadoCivil>> Post([FromBody] EstadoCivil item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdEstadoCivil }, item);
        }

        /// <summary>
        /// Actualiza un estado civil existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] EstadoCivil item)
        {
            if (id != item.IdEstadoCivil)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un estado civil por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
