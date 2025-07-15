// Controllers/Catalogos/ContinuarSolicitudController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ContinuarSolicitudController : ControllerBase
    {
        private readonly IRepository<ContinuarSolicitud> _repo;

        /// <summary>
        /// Constructor del controlador de ContinuarSolicitud.
        /// </summary>
        public ContinuarSolicitudController(IRepository<ContinuarSolicitud> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las opciones de ContinuarSolicitud.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ContinuarSolicitud>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una opción de ContinuarSolicitud por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ContinuarSolicitud>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva opción de ContinuarSolicitud.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ContinuarSolicitud>> Post([FromBody] ContinuarSolicitud item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdContinuarSolicitud }, item);
        }

        /// <summary>
        /// Actualiza una opción de ContinuarSolicitud existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ContinuarSolicitud item)
        {
            if (id != item.IdContinuarSolicitud)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una opción de ContinuarSolicitud por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
