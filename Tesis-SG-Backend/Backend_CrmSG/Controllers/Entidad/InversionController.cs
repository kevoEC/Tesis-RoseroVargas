using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Services.Entidad;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.Services.Entidad.Inversion;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de inversiones.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InversionController : ControllerBase
    {
        private readonly IInversionService _service;

        /// <summary>
        /// Constructor del controlador de inversiones.
        /// </summary>
        /// <param name="service">Servicio de lógica de inversiones.</param>
        public InversionController(IInversionService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene la lista de todas las inversiones registradas.
        /// </summary>
        /// <returns>Lista de inversiones.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var inversiones = await _service.ObtenerTodasAsync();
            return Ok(inversiones);
        }

        /// <summary>
        /// Obtiene los datos de una inversión por su identificador.
        /// </summary>
        /// <param name="id">Identificador de la inversión.</param>
        /// <returns>Datos de la inversión encontrada, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var inversion = await _service.ObtenerPorIdAsync(id);
            if (inversion == null)
                return NotFound(new { success = false, message = "Inversión no encontrada." });

            return Ok(inversion);
        }

        /// <summary>
        /// Obtiene la lista de inversiones asignadas a un usuario propietario.
        /// </summary>
        /// <param name="idUsuario">Identificador del usuario propietario.</param>
        /// <returns>Lista de inversiones del propietario.</returns>
        [HttpGet("por-propietario/{idUsuario}")]
        public async Task<IActionResult> GetPorPropietario(int idUsuario)
        {
            var inversiones = await _service.ObtenerPorPropietarioAsync(idUsuario);
            return Ok(inversiones);
        }

        /// <summary>
        /// Obtiene la lista de inversiones asignadas a un cliente específico.
        /// </summary>
        /// <param name="idCliente">Identificador del cliente.</param>
        /// <returns>Lista de inversiones del cliente.</returns>
        [HttpGet("por-cliente/{idCliente}")]
        public async Task<IActionResult> GetPorCliente(int idCliente)
        {
            var inversiones = await _service.ObtenerPorClienteAsync(idCliente);
            return Ok(inversiones);
        }

    }
}
