using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Seguridad;
using Backend_CrmSG.Services.Seguridad;

namespace Backend_CrmSG.Controllers.Seguridad
{
    /// <summary>
    /// Controlador para la gestión de asignación de roles a usuarios.
    /// Permite consultar, asignar, actualizar y eliminar relaciones usuario-rol.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsuarioRolController : ControllerBase
    {
        private readonly IUsuarioRolService _usuarioRolService;

        /// <summary>
        /// Constructor para inyección de dependencias.
        /// </summary>
        public UsuarioRolController(IUsuarioRolService usuarioRolService)
        {
            _usuarioRolService = usuarioRolService;
        }

        /// <summary>
        /// Obtiene todas las relaciones usuario-rol existentes.
        /// </summary>
        /// <returns>Listado de UsuarioRol.</returns>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            IEnumerable<UsuarioRol> usuarioRoles = await _usuarioRolService.GetAllAsync();
            return Ok(usuarioRoles);
        }

        /// <summary>
        /// Obtiene todos los roles asignados a un usuario específico.
        /// </summary>
        /// <param name="idUsuario">Id del usuario.</param>
        /// <returns>Listado de roles asociados al usuario.</returns>
        [HttpGet("usuario/{idUsuario}")]
        public async Task<IActionResult> GetByUsuario(int idUsuario)
        {
            var lista = await _usuarioRolService.GetByUsuarioIdAsync(idUsuario);
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene todos los usuarios que tienen asignado un rol específico.
        /// </summary>
        /// <param name="idRol">Id del rol.</param>
        /// <returns>Listado de usuarios asociados al rol.</returns>
        [HttpGet("rol/{idRol}")]
        public async Task<IActionResult> GetByRol(int idRol)
        {
            var lista = await _usuarioRolService.GetByRolIdAsync(idRol);
            return Ok(lista);
        }

        /// <summary>
        /// Asigna un rol a un usuario.
        /// </summary>
        /// <param name="usuarioRol">Objeto UsuarioRol con la relación a crear.</param>
        /// <returns>Mensaje de éxito.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] UsuarioRol usuarioRol)
        {
            await _usuarioRolService.AddAsync(usuarioRol);
            return Ok(new { message = "Rol asignado al usuario correctamente." });
        }

        /// <summary>
        /// Actualiza una relación usuario-rol existente.
        /// </summary>
        /// <param name="usuarioRol">Objeto UsuarioRol con los datos actualizados.</param>
        /// <returns>Mensaje de éxito.</returns>
        [HttpPut]
        public async Task<IActionResult> Put([FromBody] UsuarioRol usuarioRol)
        {
            await _usuarioRolService.UpdateAsync(usuarioRol);
            return Ok(new { message = "La relación usuario-rol se actualizó correctamente." });
        }

        /// <summary>
        /// Elimina la relación usuario-rol para un usuario y un rol específicos.
        /// </summary>
        /// <param name="idUsuario">Id del usuario.</param>
        /// <param name="idRol">Id del rol.</param>
        /// <returns>Mensaje de éxito.</returns>
        [HttpDelete("{idUsuario}/{idRol}")]
        public async Task<IActionResult> Delete(int idUsuario, int idRol)
        {
            await _usuarioRolService.DeleteAsync(idUsuario, idRol);
            return Ok(new { message = "La relación usuario-rol se eliminó correctamente." });
        }
    }
}
