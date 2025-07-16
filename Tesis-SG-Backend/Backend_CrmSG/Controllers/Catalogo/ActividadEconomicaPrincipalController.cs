using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

/// <summary>
/// Controlador para la gestión del catálogo de Actividades Económicas Principales.
/// </summary>
namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ActividadEconomicaPrincipalController : ControllerBase
    {
        private readonly IRepository<ActividadEconomicaPrincipal> _repo;

        /// <summary>
        /// Constructor del controlador.
        /// </summary>
        public ActividadEconomicaPrincipalController(IRepository<ActividadEconomicaPrincipal> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todas las actividades económicas principales.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ActividadEconomicaPrincipal>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene una actividad económica principal por su ID.
        /// </summary>
        /// <param name="id">ID de la actividad económica principal.</param>
        [HttpGet("{id}")]
        public async Task<ActionResult<ActividadEconomicaPrincipal>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea una nueva actividad económica principal.
        /// </summary>
        /// <param name="item">Objeto ActividadEconomicaPrincipal a crear.</param>
        [HttpPost]
        public async Task<ActionResult<ActividadEconomicaPrincipal>> Post([FromBody] ActividadEconomicaPrincipal item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdActividadEconomicaPrincipal }, item);
        }

        /// <summary>
        /// Actualiza una actividad económica principal existente.
        /// </summary>
        /// <param name="id">ID de la actividad a actualizar.</param>
        /// <param name="item">Objeto actualizado.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ActividadEconomicaPrincipal item)
        {
            if (id != item.IdActividadEconomicaPrincipal)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina una actividad económica principal por su ID.
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
