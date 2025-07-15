using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de referencias asociadas a solicitudes de inversión.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ReferenciaController : ControllerBase
    {
        private readonly IRepository<Referencia> _referenciaRepository;

        /// <summary>
        /// Constructor del controlador de referencias.
        /// </summary>
        /// <param name="referenciaRepository">Repositorio de referencias.</param>
        public ReferenciaController(IRepository<Referencia> referenciaRepository)
        {
            _referenciaRepository = referenciaRepository;
        }

        /// <summary>
        /// Obtiene la lista de todas las referencias registradas.
        /// </summary>
        /// <returns>Lista de referencias.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _referenciaRepository.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene los datos de una referencia por su identificador.
        /// </summary>
        /// <param name="id">Identificador de la referencia.</param>
        /// <returns>Datos de la referencia encontrada, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _referenciaRepository.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Crea una nueva referencia.
        /// </summary>
        /// <param name="referencia">Datos de la referencia a crear.</param>
        /// <returns>Referencia creada.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Referencia referencia)
        {
            await _referenciaRepository.AddAsync(referencia);
            return CreatedAtAction(nameof(Get), new { id = referencia.IdReferencia }, referencia);
        }

        /// <summary>
        /// Actualiza los datos de una referencia existente.
        /// </summary>
        /// <param name="id">Identificador de la referencia.</param>
        /// <param name="referencia">Datos actualizados de la referencia.</param>
        /// <returns>NoContent si la actualización fue exitosa, BadRequest si el id no coincide.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Referencia referencia)
        {
            if (id != referencia.IdReferencia)
                return BadRequest();

            await _referenciaRepository.UpdateAsync(referencia);
            return NoContent();
        }

        /// <summary>
        /// Elimina una referencia por su identificador.
        /// </summary>
        /// <param name="id">Identificador de la referencia.</param>
        /// <returns>NoContent si la eliminación fue exitosa.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _referenciaRepository.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Obtiene la lista de referencias asociadas a una solicitud de inversión específica.
        /// </summary>
        /// <param name="idSolicitudInversion">Identificador de la solicitud de inversión.</param>
        /// <returns>Lista de referencias asociadas a la solicitud.</returns>
        [HttpGet("por-solicitud/{idSolicitudInversion}")]
        public async Task<IActionResult> GetPorSolicitud(int idSolicitudInversion)
        {
            var referencias = await _referenciaRepository.GetByPropertyAsync("IdSolicitudInversion", idSolicitudInversion);
            return Ok(referencias);
        }
    }
}
