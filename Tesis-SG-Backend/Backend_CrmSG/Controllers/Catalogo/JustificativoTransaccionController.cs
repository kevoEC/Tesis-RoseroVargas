// Controllers/Catalogos/JustificativoTransaccionController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JustificativoTransaccionController : ControllerBase
    {
        private readonly IRepository<JustificativoTransaccion> _repo;

        /// <summary>
        /// Constructor del controlador de JustificativoTransaccion.
        /// </summary>
        public JustificativoTransaccionController(IRepository<JustificativoTransaccion> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los justificativos de transacción.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<JustificativoTransaccion>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un justificativo de transacción por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<JustificativoTransaccion>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo justificativo de transacción.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<JustificativoTransaccion>> Post([FromBody] JustificativoTransaccion item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdJustificativoTransaccion }, item);
        }

        /// <summary>
        /// Actualiza un justificativo de transacción existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] JustificativoTransaccion item)
        {
            if (id != item.IdJustificativoTransaccion)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un justificativo de transacción por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
