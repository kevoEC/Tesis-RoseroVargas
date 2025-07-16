using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoClienteController : ControllerBase
    {
        private readonly IRepository<TipoCliente> _repository;

        /// <summary>
        /// Constructor del controlador de TipoCliente.
        /// </summary>
        public TipoClienteController(IRepository<TipoCliente> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todos los tipos de cliente registrados.
        /// </summary>
        /// <returns>Lista de tipos de cliente.</returns>
        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _repository.GetAllAsync());

        /// <summary>
        /// Obtiene un tipo de cliente por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de cliente.</param>
        /// <returns>Tipo de cliente encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        /// <summary>
        /// Crea un nuevo tipo de cliente.
        /// </summary>
        /// <param name="item">Objeto TipoCliente a crear.</param>
        /// <returns>El tipo de cliente creado.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] TipoCliente item)
        {
            await _repository.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdTipoCliente }, item);
        }

        /// <summary>
        /// Actualiza un tipo de cliente existente.
        /// </summary>
        /// <param name="id">ID del tipo de cliente a actualizar.</param>
        /// <param name="item">Objeto TipoCliente con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoCliente item)
        {
            if (id != item.IdTipoCliente) return BadRequest();
            await _repository.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de cliente por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de cliente a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
