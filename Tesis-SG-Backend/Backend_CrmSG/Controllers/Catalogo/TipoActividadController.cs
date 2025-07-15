using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoActividadController : ControllerBase
    {
        private readonly IRepository<TipoActividad> _repository;

        /// <summary>
        /// Constructor del controlador de TipoActividad.
        /// </summary>
        public TipoActividadController(IRepository<TipoActividad> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todos los tipos de actividad registrados.
        /// </summary>
        /// <returns>Lista de tipos de actividad.</returns>
        // GET: api/TipoActividad
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoActividad>>> Get()
        {
            var tipos = await _repository.GetAllAsync();
            return Ok(tipos);
        }

        /// <summary>
        /// Obtiene un tipo de actividad por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de actividad.</param>
        /// <returns>Tipo de actividad encontrado o NotFound si no existe.</returns>
        // GET: api/TipoActividad/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoActividad>> Get(int id)
        {
            var tipo = await _repository.GetByIdAsync(id);
            if (tipo == null)
                return NotFound();
            return Ok(tipo);
        }

        /// <summary>
        /// Crea un nuevo tipo de actividad.
        /// </summary>
        /// <param name="tipoActividad">Objeto TipoActividad a crear.</param>
        /// <returns>El tipo de actividad creado.</returns>
        // POST: api/TipoActividad
        [HttpPost]
        public async Task<ActionResult<TipoActividad>> Post([FromBody] TipoActividad tipoActividad)
        {
            await _repository.AddAsync(tipoActividad);
            return CreatedAtAction(nameof(Get), new { id = tipoActividad.IdTipoActividad }, tipoActividad);
        }

        /// <summary>
        /// Actualiza un tipo de actividad existente.
        /// </summary>
        /// <param name="id">ID del tipo de actividad a actualizar.</param>
        /// <param name="tipoActividad">Objeto TipoActividad con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        // PUT: api/TipoActividad/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoActividad tipoActividad)
        {
            if (id != tipoActividad.IdTipoActividad)
                return BadRequest();
            await _repository.UpdateAsync(tipoActividad);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de actividad por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de actividad a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        // DELETE: api/TipoActividad/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
