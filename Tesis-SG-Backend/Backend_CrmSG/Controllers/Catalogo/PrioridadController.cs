// Controllers/Catalogos/PrioridadController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PrioridadController : ControllerBase
    {
        private readonly IRepository<Prioridad> _prioridadRepository;

        /// <summary>
        /// Constructor del controlador de Prioridad.
        /// </summary>
        public PrioridadController(IRepository<Prioridad> prioridadRepository)
        {
            _prioridadRepository = prioridadRepository;
        }

        /// <summary>
        /// Obtiene todas las prioridades registradas.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prioridad>>> Get()
        {
            var prioridades = await _prioridadRepository.GetAllAsync();
            return Ok(prioridades);
        }

        /// <summary>
        /// Obtiene una prioridad por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Prioridad>> Get(int id)
        {
            var prioridad = await _prioridadRepository.GetByIdAsync(id);
            if (prioridad == null)
                return NotFound();
            return Ok(prioridad);
        }

        /// <summary>
        /// Crea una nueva prioridad.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Prioridad>> Post([FromBody] Prioridad prioridad)
        {
            await _prioridadRepository.AddAsync(prioridad);
            return CreatedAtAction(nameof(Get), new { id = prioridad.IdPrioridad }, prioridad);
        }

        /// <summary>
        /// Actualiza una prioridad existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Prioridad prioridad)
        {
            if (id != prioridad.IdPrioridad)
                return BadRequest();
            await _prioridadRepository.UpdateAsync(prioridad);
            return NoContent();
        }

        /// <summary>
        /// Elimina una prioridad por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _prioridadRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
