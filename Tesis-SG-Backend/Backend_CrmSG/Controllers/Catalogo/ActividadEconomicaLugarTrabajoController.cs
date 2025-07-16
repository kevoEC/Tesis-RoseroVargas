using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

/// <summary>
/// Controlador para la gestión del catálogo de Actividades Económicas del Lugar de Trabajo.
/// </summary>
namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ActividadEconomicaLugarTrabajoController : ControllerBase
    {
        private readonly IRepository<ActividadEconomicaLugarTrabajo> _repo;

        /// <summary>
        /// Constructor del controlador.
        /// </summary>
        public ActividadEconomicaLugarTrabajoController(IRepository<ActividadEconomicaLugarTrabajo> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las actividades económicas del lugar de trabajo.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActividadEconomicaLugarTrabajo>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una actividad económica por su ID.
        /// </summary>
        /// <param name="id">ID de la actividad económica.</param>
        [HttpGet("{id}")]
        public async Task<ActionResult<ActividadEconomicaLugarTrabajo>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva actividad económica.
        /// </summary>
        /// <param name="item">Objeto ActividadEconomicaLugarTrabajo a crear.</param>
        [HttpPost]
        public async Task<ActionResult<ActividadEconomicaLugarTrabajo>> Post([FromBody] ActividadEconomicaLugarTrabajo item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdActividadEconomicaLugarTrabajo }, item);
        }

        /// <summary>
        /// Actualiza una actividad económica existente.
        /// </summary>
        /// <param name="id">ID de la actividad a actualizar.</param>
        /// <param name="item">Objeto actualizado.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ActividadEconomicaLugarTrabajo item)
        {
            if (id != item.IdActividadEconomicaLugarTrabajo)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una actividad económica por su ID.
        /// </summary>
        /// <param name="id">ID de la actividad a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
