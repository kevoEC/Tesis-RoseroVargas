﻿// Controllers/Catalogo/ModoFirmaController.cs
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Catalogos;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Catalogo
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ModoFirmaController : ControllerBase
    {
        private readonly IRepository<ModoFirma> _repo;

        /// <summary>
        /// Constructor del controlador de ModoFirma.
        /// </summary>
        public ModoFirmaController(IRepository<ModoFirma> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene todos los modos de firma disponibles.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ModoFirma>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un modo de firma por su ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ModoFirma>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo modo de firma.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ModoFirma>> Post([FromBody] ModoFirma item)
        {
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdModoFirma }, item);
        }

        /// <summary>
        /// Actualiza un modo de firma existente.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ModoFirma item)
        {
            if (id != item.IdModoFirma)
                return BadRequest();
            await _repo.UpdateAsync(item);
            return NoContent();
        }

        /// <summary>
        /// Elimina un modo de firma por su ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
