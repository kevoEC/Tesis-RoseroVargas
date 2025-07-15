using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Seguridad;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Seguridad
{
    /// <summary>
    /// Controlador para la administración de permisos.
    /// Permite operaciones CRUD sobre permisos de seguridad.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PermisoController : ControllerBase
    {
        private readonly IRepository<Permiso> _permisoRepository;

        /// <summary>
        /// Constructor del controlador de permisos.
        /// </summary>
        public PermisoController(IRepository<Permiso> permisoRepository)
        {
            _permisoRepository = permisoRepository;
        }

        /// <summary>
        /// Obtiene la lista de todos los permisos registrados en el sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var permisos = await _permisoRepository.GetAllAsync();
            return Ok(permisos);
        }

        /// <summary>
        /// Obtiene la información de un permiso específico por su identificador.
        /// </summary>
        /// <param name="id">Id del permiso.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var permiso = await _permisoRepository.GetByIdAsync(id);
            if (permiso == null)
                return NotFound();
            return Ok(permiso);
        }

        /// <summary>
        /// Crea un nuevo permiso de seguridad.
        /// </summary>
        /// <param name="permiso">Objeto permiso a registrar.</param>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Permiso permiso)
        {
            await _permisoRepository.AddAsync(permiso);
            return CreatedAtAction(nameof(GetById), new { id = permiso.IdPermiso }, permiso);
        }

        /// <summary>
        /// Actualiza la información de un permiso existente.
        /// </summary>
        /// <param name="id">Id del permiso a actualizar.</param>
        /// <param name="permiso">Objeto permiso con los datos actualizados.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Permiso permiso)
        {
            if (id != permiso.IdPermiso)
                return BadRequest("El ID del permiso no coincide.");
            await _permisoRepository.UpdateAsync(permiso);
            return NoContent();
        }

        /// <summary>
        /// Elimina un permiso por su identificador.
        /// </summary>
        /// <param name="id">Id del permiso a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _permisoRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
