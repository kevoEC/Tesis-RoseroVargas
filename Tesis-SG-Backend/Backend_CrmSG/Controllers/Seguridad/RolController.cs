using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Seguridad;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Seguridad
{
    /// <summary>
    /// Controlador para la administración de roles de seguridad.
    /// Permite operaciones CRUD sobre los roles del sistema.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RolController : ControllerBase
    {
        private readonly IRepository<Rol> _rolRepository;

        /// <summary>
        /// Constructor del controlador de roles.
        /// </summary>
        public RolController(IRepository<Rol> rolRepository)
        {
            _rolRepository = rolRepository;
        }

        /// <summary>
        /// Obtiene la lista de todos los roles registrados en el sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var roles = await _rolRepository.GetAllAsync();
            return Ok(roles);
        }

        /// <summary>
        /// Obtiene la información de un rol específico por su identificador.
        /// </summary>
        /// <param name="id">Id del rol.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rol = await _rolRepository.GetByIdAsync(id);
            if (rol == null)
                return NotFound();
            return Ok(rol);
        }

        /// <summary>
        /// Crea un nuevo rol de seguridad.
        /// </summary>
        /// <param name="rol">Objeto rol a registrar.</param>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Rol rol)
        {
            await _rolRepository.AddAsync(rol);
            return CreatedAtAction(nameof(GetById), new { id = rol.IdRol }, rol);
        }

        /// <summary>
        /// Actualiza la información de un rol existente.
        /// </summary>
        /// <param name="id">Id del rol a actualizar.</param>
        /// <param name="rol">Objeto rol con los datos actualizados.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Rol rol)
        {
            if (id != rol.IdRol)
                return BadRequest("El ID del rol no coincide.");
            await _rolRepository.UpdateAsync(rol);
            return NoContent();
        }

        /// <summary>
        /// Elimina un rol por su identificador.
        /// </summary>
        /// <param name="id">Id del rol a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _rolRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
