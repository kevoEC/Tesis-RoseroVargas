// Controllers/Catalogos/TipoSolicitudController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoSolicitudController : ControllerBase
    {
        private readonly IRepository<TipoSolicitud> _repository;

        /// <summary>
        /// Constructor del controlador de TipoSolicitud.
        /// </summary>
        public TipoSolicitudController(IRepository<TipoSolicitud> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todos los tipos de solicitud.
        /// </summary>
        /// <returns>Lista de tipos de solicitud.</returns>
        [HttpGet]
        public async Task<IActionResult> Get() => Ok(await _repository.GetAllAsync());

        /// <summary>
        /// Obtiene un tipo de solicitud por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de solicitud.</param>
        /// <returns>Tipo de solicitud encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        /// <summary>
        /// Crea un nuevo tipo de solicitud.
        /// </summary>
        /// <param name="item">Objeto TipoSolicitud a crear.</param>
        /// <returns>El tipo de solicitud creado.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] TipoSolicitud item)
        {
            await _repository.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdTipoDeSolicitud }, item);
        }

        /// <summary>
        /// Actualiza un tipo de solicitud existente.
        /// </summary>
        /// <param name="id">ID del tipo de solicitud a actualizar.</param>
        /// <param name="item">Objeto TipoSolicitud con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoSolicitud item)
        {
            if (id != item.IdTipoDeSolicitud) return BadRequest();
            await _repository.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de solicitud por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de solicitud a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
