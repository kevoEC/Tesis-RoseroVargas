using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Services.Producto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Backend_CrmSG.Controllers.Producto
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ConfiguracionProductoController : ControllerBase
    {
        private readonly IConfiguracionProductoService _service;

        public ConfiguracionProductoController(IConfiguracionProductoService service)
        {
            _service = service;
        }

        // GET: api/configuracionproducto/{idProducto}
        [HttpGet("{idProducto}")]
        public async Task<IActionResult> GetByProducto(int idProducto)
        {
            var result = await _service.GetConfiguracionesByProductoAsync(idProducto);
            return Ok(result);
        }

        // GET: api/configuracionproducto/detalle/{id}
        [HttpGet("detalle/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // POST: api/configuracionproducto
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ConfiguracionesProducto config)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _service.CreateAsync(config);
            return CreatedAtAction(nameof(GetById), new { id = created.IdConfiguraciones }, created);
        }

        // PUT: api/configuracionproducto/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ConfiguracionesProducto config)
        {
            var updated = await _service.UpdateAsync(id, config);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        // DELETE: api/configuracionproducto/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("vista")]
        public async Task<IActionResult> GetAllConfiguracionesVista()
        {
            var result = await _service.GetAllConfiguracionesVistaAsync();
            return Ok(result);
        }

        [HttpGet("vista/{id}")]
        public async Task<IActionResult> GetConfiguracionVistaById(int id)
        {
            var result = await _service.GetConfiguracionVistaByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("vista/por-producto/{idProducto}")]
        public async Task<IActionResult> GetConfiguracionesVistaPorProducto(int idProducto)
        {
            var configuraciones = await _service.GetVistaByProductoIdAsync(idProducto);
            return Ok(configuraciones);
        }

    }
}
