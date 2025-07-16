using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;
using Backend_CrmSG.Models.Catalogos;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CiudadController : ControllerBase
    {
        private readonly IRepository<Ciudad> _repo;

        /// <summary>
        /// Constructor del controlador de ciudades.
        /// </summary>
        public CiudadController(IRepository<Ciudad> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las ciudades.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ciudad>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una ciudad por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Ciudad>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Obtiene todas las ciudades de una provincia específica.
        /// </summary>
        [HttpGet("por-provincia/{idProvincia}")]
        public async Task<ActionResult<IEnumerable<Ciudad>>> GetPorProvincia(int idProvincia)
        {
            var lista = await _repo.GetByPropertyAsync(nameof(Ciudad.IdProvincia), idProvincia);
            return Ok(lista);
        }

        /// <summary>
        /// Crea una nueva ciudad.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Ciudad>> Post([FromBody] Ciudad item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdCiudad }, item);
        }

        /// <summary>
        /// Actualiza una ciudad existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Ciudad item)
        {
            if (id != item.IdCiudad)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una ciudad por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
