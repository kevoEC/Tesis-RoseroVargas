// Controllers/Catalogos/ProductoInteresController.cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;

namespace Backend_CrmSG.Controllers.Catalogos
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoInteresController : ControllerBase
    {
        private readonly IRepository<ProductoInteres> _repository;

        /// <summary>
        /// Constructor del controlador de ProductoInteres.
        /// </summary>
        public ProductoInteresController(IRepository<ProductoInteres> repository)
        {
            _repository = repository;
        }

        /// <summary>
        /// Obtiene todos los productos de interés registrados.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoInteres>>> Get()
        {
            var productos = await _repository.GetAllAsync();
            return Ok(productos);
        }

        /// <summary>
        /// Obtiene un producto de interés por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductoInteres>> Get(int id)
        {
            var producto = await _repository.GetByIdAsync(id);
            if (producto == null)
                return NotFound();
            return Ok(producto);
        }

        /// <summary>
        /// Crea un nuevo producto de interés.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ProductoInteres>> Post([FromBody] ProductoInteres productoInteres)
        {
            await _repository.AddAsync(productoInteres);
            return CreatedAtAction(nameof(Get), new { id = productoInteres.IdProductoInteres }, productoInteres);
        }

        /// <summary>
        /// Actualiza un producto de interés existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ProductoInteres productoInteres)
        {
            if (id != productoInteres.IdProductoInteres)
                return BadRequest();
            await _repository.UpdateAsync(productoInteres);
            return NoContent();
        }

        /// <summary>
        /// Elimina un producto de interés por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }
    }
}
