using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para gestionar las actividades.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ActividadController : ControllerBase
    {
        private readonly IRepository<Actividad> _actividadRepository;

        /// <summary>
        /// Constructor del controlador de actividades.
        /// </summary>
        /// <param name="actividadRepository">Repositorio de actividades.</param>
        public ActividadController(IRepository<Actividad> actividadRepository)
        {
            _actividadRepository = actividadRepository;
        }

        /// <summary>
        /// Obtiene la lista de todas las actividades.
        /// </summary>
        /// <returns>Lista de actividades.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _actividadRepository.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene una actividad por su identificador.
        /// </summary>
        /// <param name="id">Identificador de la actividad.</param>
        /// <returns>Actividad encontrada o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _actividadRepository.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Crea una nueva actividad.
        /// </summary>
        /// <param name="actividad">Datos de la actividad a crear.</param>
        /// <returns>Actividad creada.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Actividad actividad)
        {
            await _actividadRepository.AddAsync(actividad);
            return CreatedAtAction(nameof(Get), new { id = actividad.IdActividad }, actividad);
        }

        /// <summary>
        /// Actualiza una actividad existente.
        /// </summary>
        /// <param name="id">Identificador de la actividad.</param>
        /// <param name="actividad">Datos actualizados de la actividad.</param>
        /// <returns>NoContent si la actualización fue exitosa, BadRequest si el id no coincide.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Actividad actividad)
        {
            if (id != actividad.IdActividad)
                return BadRequest();

            await _actividadRepository.UpdateAsync(actividad);
            return NoContent();
        }

        /// <summary>
        /// Elimina una actividad por su identificador.
        /// </summary>
        /// <param name="id">Identificador de la actividad.</param>
        /// <returns>NoContent si la eliminación fue exitosa.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _actividadRepository.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Obtiene todas las actividades asociadas a un prospecto.
        /// </summary>
        /// <param name="idProspecto">Identificador del prospecto.</param>
        /// <returns>Lista de actividades del prospecto.</returns>
        [HttpGet("por-prospecto/{idProspecto}")]
        public async Task<IActionResult> GetPorProspecto(int idProspecto)
        {
            var actividades = await _actividadRepository.GetByPropertyAsync("IdProspecto", idProspecto);
            return Ok(actividades);
        }
    }
}
