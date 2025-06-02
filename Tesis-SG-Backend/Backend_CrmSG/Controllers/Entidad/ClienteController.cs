using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.Services.Entidad;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        // GET: api/cliente
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var clientes = await _clienteService.ObtenerTodosAsync();
            return Ok(clientes);
        }

        // GET: api/cliente/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var cliente = await _clienteService.ObtenerPorIdAsync(id);
            if (cliente == null)
                return NotFound(new { success = false, message = "Cliente no encontrado." });

            return Ok(cliente);
        }

        // GET: api/cliente/por-propietario/{idUsuario}
        [HttpGet("por-propietario/{idUsuario}")]
        public async Task<IActionResult> GetPorPropietario(int idUsuario)
        {
            var clientes = await _clienteService.ObtenerPorPropietarioAsync(idUsuario);
            return Ok(clientes);
        }

        // PUT: api/cliente/{id}
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
