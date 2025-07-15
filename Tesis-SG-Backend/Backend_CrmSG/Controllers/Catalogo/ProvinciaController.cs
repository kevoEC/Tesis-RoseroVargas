// Controllers/Catalogos/ProvinciaController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProvinciaController : ControllerBase
    {
        private readonly IRepository<Provincia> _repo;

        /// <summary>
        /// Constructor del controlador de Provincia.
        /// </summary>
        public ProvinciaController(IRepository<Provincia> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las provincias registradas.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Provincia>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una provincia por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Provincia>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Obtiene las provincias asociadas a un país específico.
        /// </summary>
        [HttpGet("por-pais/{idPais}")]
        public async Task<ActionResult<IEnumerable<Provincia>>> GetPorPais(int idPais)
        {
            var lista = await _repo.GetByPropertyAsync(nameof(Provincia.IdPais), idPais);
            return Ok(lista);
        }

        /// <summary>
        /// Crea una nueva provincia.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Provincia>> Post([FromBody] Provincia item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdProvincia }, item);
        }

        /// <summary>
        /// Actualiza una provincia existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Provincia item)
        {
            if (id != item.IdProvincia)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una provincia por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
