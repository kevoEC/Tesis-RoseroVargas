using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Services.Producto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend_CrmSG.Controllers.Producto
{
    /// <summary>
    /// Controlador para la gestión de configuraciones de productos de inversión.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ConfiguracionProductoController : ControllerBase
    {
        private readonly IConfiguracionProductoService _service;

        /// <summary>
        /// Constructor.
        /// </summary>
        public ConfiguracionProductoController(IConfiguracionProductoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene todas las configuraciones de un producto específico.
        /// </summary>
        /// <param name="idProducto">ID del producto.</param>
        /// <returns>Lista de configuraciones asociadas al producto.</returns>
        [HttpGet("{idProducto}")]
        public async Task<IActionResult> GetByProducto(int idProducto)
        {
            var result = await _service.GetConfiguracionesByProductoAsync(idProducto);
            return Ok(result);
        }

        /// <summary>
        /// Obtiene una configuración por su ID.
        /// </summary>
        /// <param name="id">ID de la configuración.</param>
        [HttpGet("detalle/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Crea una nueva configuración de producto.
        /// </summary>
        /// <param name="config">Objeto de configuración a crear.</param>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ConfiguracionesProducto config)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(config);
            return CreatedAtAction(nameof(GetById), new { id = created.IdConfiguraciones }, created);
        }

        /// <summary>
        /// Actualiza una configuración existente.
        /// </summary>
        /// <param name="id">ID de la configuración a actualizar.</param>
        /// <param name="config">Datos nuevos de la configuración.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ConfiguracionesProducto config)
        {
            var updated = await _service.UpdateAsync(id, config);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Elimina una configuración de producto por su ID.
        /// </summary>
        /// <param name="id">ID de la configuración.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _service.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Obtiene todas las configuraciones de productos (vista extendida).
        /// </summary>
        [HttpGet("vista")]
        public async Task<IActionResult> GetAllConfiguracionesVista()
        {
            var result = await _service.GetAllConfiguracionesVistaAsync();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene una configuración extendida por su ID.
        /// </summary>
        /// <param name="id">ID de la configuración (vista).</param>
        [HttpGet("vista/{id}")]
        public async Task<IActionResult> GetConfiguracionVistaById(int id)
        {
            var result = await _service.GetConfiguracionVistaByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Obtiene todas las configuraciones extendidas asociadas a un producto.
        /// </summary>
        /// <param name="idProducto">ID del producto.</param>
        [HttpGet("vista/por-producto/{idProducto}")]
        public async Task<IActionResult> GetConfiguracionesVistaPorProducto(int idProducto)
        {
            var configuraciones = await _service.GetVistaByProductoIdAsync(idProducto);
            return Ok(configuraciones);
        }
    }
}
