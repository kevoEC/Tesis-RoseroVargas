using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AgenciaController : ControllerBase
    {
        private readonly IRepository<Agencia> _agenciaRepository;

        /// <summary>
        /// Constructor del controlador de agencias.
        /// </summary>
        public AgenciaController(IRepository<Agencia> agenciaRepository)
        {
            _agenciaRepository = agenciaRepository;
        }

        /// <summary>
        /// Obtiene la lista de todas las agencias.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Agencia>>> Get()
        {
            var agencias = await _agenciaRepository.GetAllAsync();
            return Ok(agencias);
        }

        /// <summary>
        /// Obtiene una agencia por su ID.
        /// </summary>
        /// <param name="id">ID de la agencia.</param>
        [HttpGet("{id}")]
        public async Task<ActionResult<Agencia>> Get(int id)
        {
            var agencia = await _agenciaRepository.GetByIdAsync(id);
            if (agencia == null)
                return NotFound();
            return Ok(agencia);
        }

        /// <summary>
        /// Crea una nueva agencia.
        /// </summary>
        /// <param name="agencia">Objeto agencia a crear.</param>
        [HttpPost]
        public async Task<ActionResult<Agencia>> Post([FromBody] Agencia agencia)
        {
            await _agenciaRepository.AddAsync(agencia);
            return CreatedAtAction(nameof(Get), new { id = agencia.IdAgencia }, agencia);
        }

        /// <summary>
        /// Actualiza una agencia existente.
        /// </summary>
        /// <param name="id">ID de la agencia.</param>
        /// <param name="agencia">Objeto agencia actualizado.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Agencia agencia)
        {
            if (id != agencia.IdAgencia)
                return BadRequest();
            await _agenciaRepository.UpdateAsync(agencia);
            return NoContent();
        }

        /// <summary>
        /// Elimina una agencia por su ID.
        /// </summary>
        /// <param name="id">ID de la agencia a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _agenciaRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
