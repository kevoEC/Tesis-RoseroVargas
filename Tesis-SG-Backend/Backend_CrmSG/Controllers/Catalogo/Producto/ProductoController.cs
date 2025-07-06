using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Services;
using Backend_CrmSG.Services.Producto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using ProductoModel = Backend_CrmSG.Models.Catalogos.Producto.Producto;

namespace Backend_CrmSG.Controllers.Producto
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;
        private readonly IConfiguracionProductoService _configuracionProductoService;

        public ProductoController(IProductoService productoService, IConfiguracionProductoService configuracionProductoService)
        {
            _productoService = productoService;
            _configuracionProductoService = configuracionProductoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var productos = await _productoService.GetAllProductosAsync();
            return Ok(productos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var producto = await _productoService.GetProductoByIdAsync(id);
            if (producto == null)
                return NotFound();

            return Ok(producto);
        }

        [HttpGet("{id}/configuraciones")]
        public async Task<IActionResult> GetConfiguraciones(int id)
        {
            var configuraciones = await _productoService.GetConfiguracionesByProductoIdAsync(id);
            return Ok(configuraciones);
        }

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

        [HttpGet("vista")]
        public async Task<IActionResult> GetAllProductosVista()
        {
            var productosVista = await _productoService.GetAllProductosVistaAsync();
            return Ok(productosVista);
        }

        [HttpGet("vista/{id}")]
        public async Task<IActionResult> GetProductoVistaById(int id)
        {
            var productoVista = await _productoService.GetProductoVistaByIdAsync(id);
            if (productoVista == null)
                return NotFound();
            return Ok(productoVista);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductoModel model)
        {
            var id = await _productoService.CreateProductoAsync(model);
            return CreatedAtAction(nameof(Get), new { id }, model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductoModel model)
        {
            var updated = await _productoService.UpdateProductoAsync(id, model);
            if (!updated)
                return NotFound();
            return NoContent();
        }

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
