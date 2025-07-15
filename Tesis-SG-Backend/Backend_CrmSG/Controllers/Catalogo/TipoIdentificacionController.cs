// Controllers/Catalogos/TipoIdentificacionController.cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoIdentificacionController : ControllerBase
    {
        private readonly IRepository<TipoIdentificacion> _repository;

        /// <summary>
        /// Constructor del controlador de TipoIdentificacion.
        /// </summary>
        public TipoIdentificacionController(IRepository<TipoIdentificacion> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todos los tipos de identificación.
        /// </summary>
        /// <returns>Lista de tipos de identificación.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TipoIdentificacion>>> Get()
        {
            var tipos = await _repository.GetAllAsync();
            return Ok(tipos);
        }

        /// <summary>
        /// Obtiene un tipo de identificación por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de identificación.</param>
        /// <returns>Tipo de identificación encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<TipoIdentificacion>> Get(int id)
        {
            var tipo = await _repository.GetByIdAsync(id);
            if (tipo == null)
                return NotFound();
            return Ok(tipo);
        }

        /// <summary>
        /// Crea un nuevo tipo de identificación.
        /// </summary>
        /// <param name="tipoIdentificacion">Objeto TipoIdentificacion a crear.</param>
        /// <returns>El tipo de identificación creado.</returns>
        [HttpPost]
        public async Task<ActionResult<TipoIdentificacion>> Post([FromBody] TipoIdentificacion tipoIdentificacion)
        {
            await _repository.AddAsync(tipoIdentificacion);
            return CreatedAtAction(nameof(Get), new { id = tipoIdentificacion.IdTipoIdentificacion }, tipoIdentificacion);
        }

        /// <summary>
        /// Actualiza un tipo de identificación existente.
        /// </summary>
        /// <param name="id">ID del tipo de identificación a actualizar.</param>
        /// <param name="tipoIdentificacion">Objeto TipoIdentificacion con los cambios.</param>
        /// <returns>NoContent si fue exitoso, BadRequest si los IDs no coinciden.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] TipoIdentificacion tipoIdentificacion)
        {
            if (id != tipoIdentificacion.IdTipoIdentificacion)
                return BadRequest();
            await _repository.UpdateAsync(tipoIdentificacion);
            return NoContent();
        }

        /// <summary>
        /// Elimina un tipo de identificación por su ID.
        /// </summary>
        /// <param name="id">ID del tipo de identificación a eliminar.</param>
        /// <returns>NoContent si fue exitoso.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
