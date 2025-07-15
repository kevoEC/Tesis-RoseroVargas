using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.Services.Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de clientes.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        /// <summary>
        /// Constructor del controlador de clientes.
        /// </summary>
        /// <param name="clienteService">Servicio de lógica de clientes.</param>
        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        /// <summary>
        /// Obtiene la lista de todos los clientes registrados.
        /// </summary>
        /// <returns>Lista de clientes.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var clientes = await _clienteService.ObtenerTodosAsync();
            return Ok(clientes);
        }

        /// <summary>
        /// Obtiene los datos de un cliente por su identificador.
        /// </summary>
        /// <param name="id">Identificador del cliente.</param>
        /// <returns>Datos del cliente encontrado, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var cliente = await _clienteService.ObtenerPorIdAsync(id);
            if (cliente == null)
                return NotFound(new { success = false, message = "Cliente no encontrado." });

            return Ok(cliente);
        }

        /// <summary>
        /// Obtiene la lista de clientes asignados a un usuario propietario.
        /// </summary>
        /// <param name="idUsuario">Identificador del usuario propietario.</param>
        /// <returns>Lista de clientes del propietario.</returns>
        [HttpGet("por-propietario/{idUsuario}")]
        public async Task<IActionResult> GetPorPropietario(int idUsuario)
        {
            var clientes = await _clienteService.ObtenerPorPropietarioAsync(idUsuario);
            return Ok(clientes);
        }

        /// <summary>
        /// Actualiza los datos de un cliente existente.
        /// </summary>
        /// <param name="id">Identificador del cliente a actualizar.</param>
        /// <param name="dto">Datos actualizados del cliente.</param>
        /// <returns>Resultado de la operación: éxito o error.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ClienteUpdateDTO dto)
        {
            if (id != dto.IdCliente)
                return BadRequest(new { success = false, message = "El ID enviado no coincide con el del cliente a actualizar." });

            try
            {
                await _clienteService.ActualizarClienteAsync(dto);
                return Ok(new { success = true, message = "Cliente actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
