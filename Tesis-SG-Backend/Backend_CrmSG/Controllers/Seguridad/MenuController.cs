using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Seguridad;
using Backend_CrmSG.Services.Seguridad;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Seguridad
{
    /// <summary>
    /// Controlador para la administración de menús de seguridad.
    /// Permite la gestión de menús y su consulta por rol.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        /// <summary>
        /// Constructor del controlador de menús.
        /// </summary>
        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        /// <summary>
        /// Obtiene la lista de todos los menús registrados en el sistema.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            IEnumerable<Menu> menus = await _menuService.GetAllAsync();
            return Ok(menus);
        }

        /// <summary>
        /// Obtiene la información de un menú específico por su identificador.
        /// </summary>
        /// <param name="id">Id del menú.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            Menu menu = await _menuService.GetByIdAsync(id);
            if (menu == null)
                return NotFound();
            return Ok(menu);
        }

        /// <summary>
        /// Crea un nuevo menú de seguridad.
        /// </summary>
        /// <param name="menu">Objeto menú a registrar.</param>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Menu menu)
        {
            await _menuService.AddAsync(menu);
            return CreatedAtAction(nameof(GetById), new { id = menu.IdMenu }, menu);
        }

        /// <summary>
        /// Actualiza la información de un menú existente.
        /// </summary>
        /// <param name="id">Id del menú a actualizar.</param>
        /// <param name="menu">Objeto menú con los datos actualizados.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Menu menu)
        {
            if (id != menu.IdMenu)
                return BadRequest("El ID del menú no coincide.");
            await _menuService.UpdateAsync(menu);
            return NoContent();
        }

        /// <summary>
        /// Elimina un menú por su identificador.
        /// </summary>
        /// <param name="id">Id del menú a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _menuService.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Obtiene los menús disponibles para un rol específico.
        /// </summary>
        /// <param name="rol">Nombre del rol.</param>
        [HttpGet("rol/{rol}")]
        public async Task<IActionResult> GetMenusByRole(string rol)
        {
            var menus = await _menuService.GetMenusByRoleAsync(rol);
            return Ok(menus);
        }
    }
}
