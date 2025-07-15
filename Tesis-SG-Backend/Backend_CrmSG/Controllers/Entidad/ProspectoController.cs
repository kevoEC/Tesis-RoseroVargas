using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de prospectos.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProspectoController : ControllerBase
    {
        private readonly IRepository<Prospecto> _prospectoRepository;

        /// <summary>
        /// Constructor del controlador de prospectos.
        /// </summary>
        /// <param name="prospectoRepository">Repositorio de prospectos.</param>
        public ProspectoController(IRepository<Prospecto> prospectoRepository)
        {
            _prospectoRepository = prospectoRepository;
        }

        /// <summary>
        /// Obtiene la lista de todos los prospectos registrados.
        /// </summary>
        /// <returns>Lista de prospectos.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _prospectoRepository.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene los datos de un prospecto por su identificador.
        /// </summary>
        /// <param name="id">Identificador del prospecto.</param>
        /// <returns>Datos del prospecto encontrado, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _prospectoRepository.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Crea un nuevo prospecto.
        /// </summary>
        /// <param name="prospecto">Datos del prospecto a crear.</param>
        /// <returns>Prospecto creado.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Prospecto prospecto)
        {
            await _prospectoRepository.AddAsync(prospecto);
            return CreatedAtAction(nameof(Get), new { id = prospecto.IdProspecto }, prospecto);
        }

        /// <summary>
        /// Actualiza los datos de un prospecto existente.
        /// </summary>
        /// <param name="id">Identificador del prospecto.</param>
        /// <param name="prospecto">Datos actualizados del prospecto.</param>
        /// <returns>NoContent si la actualización fue exitosa, BadRequest si el id no coincide.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Prospecto prospecto)
        {
            if (id != prospecto.IdProspecto)
                return BadRequest();
            await _prospectoRepository.UpdateAsync(prospecto);
            return NoContent();
        }

        /// <summary>
        /// Elimina un prospecto por su identificador.
        /// </summary>
        /// <param name="id">Identificador del prospecto.</param>
        /// <returns>NoContent si la eliminación fue exitosa.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _prospectoRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
