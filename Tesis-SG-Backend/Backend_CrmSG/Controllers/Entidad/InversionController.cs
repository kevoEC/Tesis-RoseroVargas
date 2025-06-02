using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Services.Entidad;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.Services.Entidad.Inversion;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InversionController : ControllerBase
    {
        private readonly IInversionService _service;

        public InversionController(IInversionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var inversiones = await _service.ObtenerTodasAsync();
            return Ok(inversiones);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var inversion = await _service.ObtenerPorIdAsync(id);
            if (inversion == null)
                return NotFound(new { success = false, message = "Inversión no encontrada." });

            return Ok(inversion);
        }

        [HttpGet("por-propietario/{idUsuario}")]
        public async Task<IActionResult> GetPorPropietario(int idUsuario)
        {
            var inversiones = await _service.ObtenerPorPropietarioAsync(idUsuario);
            return Ok(inversiones);
        }
    }
}
