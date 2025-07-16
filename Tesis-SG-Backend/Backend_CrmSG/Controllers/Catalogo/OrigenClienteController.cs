// Controllers/Catalogos/OrigenClienteController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Repositories;
using Backend_CrmSG.Models;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrigenClienteController : ControllerBase
    {
        private readonly IRepository<OrigenCliente> _origenClienteRepository;

        /// <summary>
        /// Constructor del controlador de OrigenCliente.
        /// </summary>
        public OrigenClienteController(IRepository<OrigenCliente> origenClienteRepository)
        {
            _origenClienteRepository = origenClienteRepository;
        }

        /// <summary>
        /// Obtiene todos los orígenes de cliente.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrigenCliente>>> Get()
        {
            var origenes = await _origenClienteRepository.GetAllAsync();
            return Ok(origenes);
        }

        /// <summary>
        /// Obtiene un origen de cliente por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<OrigenCliente>> Get(int id)
        {
            var origenCliente = await _origenClienteRepository.GetByIdAsync(id);
            if (origenCliente == null)
                return NotFound();
            return Ok(origenCliente);
        }

        /// <summary>
        /// Crea un nuevo origen de cliente.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<OrigenCliente>> Post([FromBody] OrigenCliente origenCliente)
        {
            await _origenClienteRepository.AddAsync(origenCliente);
            return CreatedAtAction(nameof(Get), new { id = origenCliente.IdOrigenCliente }, origenCliente);
        }

        /// <summary>
        /// Actualiza un origen de cliente existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] OrigenCliente origenCliente)
        {
            if (id != origenCliente.IdOrigenCliente)
                return BadRequest();
            await _origenClienteRepository.UpdateAsync(origenCliente);
            return NoContent();
        }

        /// <summary>
        /// Elimina un origen de cliente por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _origenClienteRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
