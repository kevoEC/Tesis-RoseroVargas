// Controllers/Catalogos/TipoCuentaController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TipoCuentaController : ControllerBase
    {
        private readonly IRepository<TipoCuenta> _repo;

        /// <summary>
        /// Constructor del controlador de TipoCuenta.
        /// </summary>
        public TipoCuentaController(IRepository<TipoCuenta> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los tipos de cuenta registrados.
        /// </summary>
        /// <returns>Lista de tipos de cuenta.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoCuenta>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un tipo de cuenta por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de cuenta.</param>
        /// <returns>Tipo de cuenta encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoCuenta>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo tipo de cuenta.
        /// </summary>
        /// <param name="item">Objeto TipoCuenta a crear.</param>
        /// <returns>El tipo de cuenta creado.</returns>
        [HttpPost]
        public async Task<ActionResult<TipoCuenta>> Post([FromBody] TipoCuenta item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdTipoCuenta }, item);
        }

        /// <summary>
        /// Actualiza un tipo de cuenta existente.
        /// </summary>
        /// <param name="id">ID del tipo de cuenta a actualizar.</param>
        /// <param name="item">Objeto TipoCuenta con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoCuenta item)
        {
            if (id != item.IdTipoCuenta)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de cuenta por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de cuenta a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
