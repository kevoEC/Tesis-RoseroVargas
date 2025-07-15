using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de beneficiarios.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class BeneficiarioController : ControllerBase
    {
        private readonly IRepository<Beneficiario> _beneficiarioRepository;

        /// <summary>
        /// Constructor del controlador de beneficiarios.
        /// </summary>
        /// <param name="beneficiarioRepository">Repositorio de beneficiarios.</param>
        public BeneficiarioController(IRepository<Beneficiario> beneficiarioRepository)
        {
            _beneficiarioRepository = beneficiarioRepository;
        }

        /// <summary>
        /// Obtiene la lista de todos los beneficiarios.
        /// </summary>
        /// <returns>Lista de beneficiarios.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var result = await _beneficiarioRepository.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene un beneficiario por su identificador.
        /// </summary>
        /// <param name="id">Identificador del beneficiario.</param>
        /// <returns>Beneficiario encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _beneficiarioRepository.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Crea un nuevo beneficiario.
        /// </summary>
        /// <param name="beneficiario">Datos del beneficiario a crear.</param>
        /// <returns>Beneficiario creado.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Beneficiario beneficiario)
        {
            await _beneficiarioRepository.AddAsync(beneficiario);
            return CreatedAtAction(nameof(Get), new { id = beneficiario.IdBeneficiario }, beneficiario);
        }

        /// <summary>
        /// Actualiza un beneficiario existente.
        /// </summary>
        /// <param name="id">Identificador del beneficiario.</param>
        /// <param name="beneficiario">Datos actualizados del beneficiario.</param>
        /// <returns>NoContent si la actualización fue exitosa, BadRequest si el id no coincide.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Beneficiario beneficiario)
        {
            if (id != beneficiario.IdBeneficiario)
                return BadRequest();
            await _beneficiarioRepository.UpdateAsync(beneficiario);
            return NoContent();
        }

        /// <summary>
        /// Elimina un beneficiario por su identificador.
        /// </summary>
        /// <param name="id">Identificador del beneficiario.</param>
        /// <returns>NoContent si la eliminación fue exitosa.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _beneficiarioRepository.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Obtiene todos los beneficiarios asociados a una solicitud de inversión.
        /// </summary>
        /// <param name="idSolicitud">Identificador de la solicitud de inversión.</param>
        /// <returns>Lista de beneficiarios relacionados con la solicitud.</returns>
        [HttpGet("por-solicitud/{idSolicitud}")]
        public async Task<IActionResult> GetPorSolicitud(int idSolicitud)
        {
            var resultado = await _beneficiarioRepository.GetByPropertyAsync("IdSolicitudInversion", idSolicitud);
            return Ok(resultado);
        }
    }
}
