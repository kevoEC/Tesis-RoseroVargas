using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Services;
using Backend_CrmSG.Services.Producto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ProductoModel = Backend_CrmSG.Models.Catalogos.Producto.Producto;

namespace Backend_CrmSG.Controllers.Producto
{
    /// <summary>
    /// Controlador para la gestión de productos de inversión y sus configuraciones.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;
        private readonly IConfiguracionProductoService _configuracionProductoService;

        /// <summary>
        /// Constructor.
        /// </summary>
        public ProductoController(IProductoService productoService, IConfiguracionProductoService configuracionProductoService)
        {
            _productoService = productoService;
            _configuracionProductoService = configuracionProductoService;
        }

        /// <summary>
        /// Obtiene todos los productos.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var productos = await _productoService.GetAllProductosAsync();
            return Ok(productos);
        }

        /// <summary>
        /// Obtiene un producto por su ID.
        /// </summary>
        /// <param name="id">ID del producto.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var producto = await _productoService.GetProductoByIdAsync(id);
            if (producto == null)
                return NotFound();
            return Ok(producto);
        }

        /// <summary>
        /// Obtiene las configuraciones asociadas a un producto específico.
        /// </summary>
        /// <param name="id">ID del producto.</param>
        [HttpGet("{id}/configuraciones")]
        public async Task<IActionResult> GetConfiguraciones(int id)
        {
            var configuraciones = await _productoService.GetConfiguracionesByProductoIdAsync(id);
            return Ok(configuraciones);
        }

        /// <summary>
        /// Obtiene un producto junto a todas sus configuraciones.
        /// </summary>
        /// <param name="id">ID del producto.</param>
        [HttpGet("{id}/detalle")]
        public async Task<IActionResult> GetProductoConConfiguraciones(int id)
        {
            var producto = await _productoService.GetProductoByIdAsync(id);
            if (producto == null)
                return NotFound();

            var configuraciones = await _configuracionProductoService.GetConfiguracionesByProductoAsync(id);

            var result = new ProductoConConfiguracionesDto
            {
                Producto = producto,
                Configuraciones = configuraciones
            };

            return Ok(result);
        }

        // ----------------------- NUEVOS ENDPOINTS -----------------------

        /// <summary>
        /// Obtiene la lista extendida de productos (vista enriquecida).
        /// </summary>
        [HttpGet("vista")]
        public async Task<IActionResult> GetAllProductosVista()
        {
            var productosVista = await _productoService.GetAllProductosVistaAsync();
            return Ok(productosVista);
        }

        /// <summary>
        /// Obtiene los datos enriquecidos (vista) de un producto por su ID.
        /// </summary>
        /// <param name="id">ID del producto.</param>
        [HttpGet("vista/{id}")]
        public async Task<IActionResult> GetProductoVistaById(int id)
        {
            var productoVista = await _productoService.GetProductoVistaByIdAsync(id);
            if (productoVista == null)
                return NotFound();
            return Ok(productoVista);
        }

        /// <summary>
        /// Crea un nuevo producto.
        /// </summary>
        /// <param name="model">Datos del producto.</param>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductoModel model)
        {
            var id = await _productoService.CreateProductoAsync(model);
            return CreatedAtAction(nameof(Get), new { id }, model);
        }

        /// <summary>
        /// Actualiza un producto existente.
        /// </summary>
        /// <param name="id">ID del producto a actualizar.</param>
        /// <param name="model">Nuevos datos del producto.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductoModel model)
        {
            var updated = await _productoService.UpdateProductoAsync(id, model);
            if (!updated)
                return NotFound();
            return NoContent();
        }

        /// <summary>
        /// Elimina un producto por su ID.
        /// </summary>
        /// <param name="id">ID del producto.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _productoService.DeleteProductoAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}
