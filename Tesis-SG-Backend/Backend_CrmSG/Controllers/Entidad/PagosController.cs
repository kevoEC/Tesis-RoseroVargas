using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Services.Entidad.Pago;
using Backend_CrmSG.DTOs.Pago;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de pagos.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PagosController : ControllerBase
    {
        private readonly IPagoService _service;

        /// <summary>
        /// Constructor del controlador de pagos.
        /// </summary>
        /// <param name="service">Servicio de lógica de pagos.</param>
        public PagosController(IPagoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene la lista de todos los pagos registrados.
        /// </summary>
        /// <returns>Lista de pagos.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var lista = await _service.ObtenerTodosAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene los datos de un pago por su identificador.
        /// </summary>
        /// <param name="id">Identificador del pago.</param>
        /// <returns>Datos del pago encontrado, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var pago = await _service.ObtenerPorIdAsync(id);
            if (pago == null)
                return NotFound(new { success = false, message = "Pago no encontrado." });
            return Ok(pago);
        }

        /// <summary>
        /// Obtiene la lista de pagos asociados a un calendario.
        /// </summary>
        /// <param name="idCalendario">Identificador del calendario.</param>
        /// <returns>Lista de pagos del calendario.</returns>
        [HttpGet("por-calendario/{idCalendario}")]
        public async Task<IActionResult> GetPorCalendario(int idCalendario)
        {
            var pagos = await _service.ObtenerPorCalendarioAsync(idCalendario);
            return Ok(pagos);
        }

        /// <summary>
        /// Crea un nuevo pago.
        /// </summary>
        /// <param name="dto">Datos para la creación del pago.</param>
        /// <returns>Identificador del nuevo pago creado.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PagoCreateDTO dto)
        {
            var idPago = await _service.CrearAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = idPago }, new { idPago });
        }

        /// <summary>
        /// Actualiza los datos de un pago existente.
        /// </summary>
        /// <param name="id">Identificador del pago.</param>
        /// <param name="dto">Datos actualizados del pago.</param>
        /// <returns>NoContent si la actualización fue exitosa.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] PagoUpdateDTO dto)
        {
            await _service.ActualizarAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Elimina un pago por su identificador.
        /// </summary>
        /// <param name="id">Identificador del pago.</param>
        /// <returns>NoContent si la eliminación fue exitosa.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.EliminarAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Genera automáticamente pagos asociados a un calendario.
        /// </summary>
        /// <param name="dto">Datos para la generación de pagos por calendario.</param>
        /// <returns>Resultado de la operación.</returns>
        [HttpPost("generar-por-calendario")]
        public async Task<IActionResult> GenerarPorCalendario([FromBody] GenerarPagosCalendarioDTO dto)
        {
            await _service.GenerarPagosPorCalendarioAsync(dto.IdCalendario, dto.IdPago, dto.IdUsuario);
            return Ok(new { success = true, message = "Pagos generados automáticamente por calendario." });
        }

        /// <summary>
        /// Realiza rollback de pagos por identificador de pago.
        /// </summary>
        /// <param name="id">Identificador del pago.</param>
        /// <param name="dto">Datos del usuario que realiza la modificación.</param>
        /// <returns>Resultado de la operación.</returns>
        [HttpPost("{id}/rollback")]
        public async Task<IActionResult> RollbackPagosPorIdPago(int id, [FromBody] RollbackUsuarioDto dto)
        {
            await _service.RollbackPagosPorIdPagoAsync(id, dto.IdUsuarioModificacion);
            return Ok(new { success = true, message = "Rollback realizado correctamente." });
        }
    }

    /// <summary>
    /// DTO auxiliar para la generación automática de pagos por calendario.
    /// </summary>
    public class GenerarPagosCalendarioDTO
    {
        /// <summary>
        /// Identificador del calendario.
        /// </summary>
        public int IdCalendario { get; set; }

        /// <summary>
        /// Identificador del pago (opcional o según la lógica).
        /// </summary>
        public int IdPago { get; set; }

        /// <summary>
        /// Identificador del usuario que realiza la acción.
        /// </summary>
        public int IdUsuario { get; set; }
    }

    /// <summary>
    /// DTO auxiliar para rollback indicando el usuario que realiza la modificación.
    /// </summary>
    public class RollbackUsuarioDto
    {
        /// <summary>
        /// Identificador del usuario que realiza la modificación.
        /// </summary>
        public int IdUsuarioModificacion { get; set; }
    }
}
