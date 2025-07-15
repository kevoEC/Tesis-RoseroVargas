using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.DTOs.Caso;
using Backend_CrmSG.Services.Entidad.Caso;
using Microsoft.AspNetCore.Authorization;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de casos.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CasosController : ControllerBase
    {
        private readonly ICasoService _service;

        /// <summary>
        /// Constructor del controlador de casos.
        /// </summary>
        /// <param name="service">Servicio de lógica de casos.</param>
        public CasosController(ICasoService service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene la lista de todos los casos registrados.
        /// </summary>
        /// <returns>Lista de casos.</returns>
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var lista = await _service.ObtenerTodosAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene el detalle de un caso por su identificador.
        /// </summary>
        /// <param name="id">Identificador del caso.</param>
        /// <returns>Detalle del caso o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var caso = await _service.ObtenerPorIdAsync(id);
            if (caso == null)
                return NotFound();
            return Ok(caso);
        }

        /// <summary>
        /// Obtiene todos los casos asociados a un cliente específico.
        /// </summary>
        /// <param name="idCliente">Identificador del cliente.</param>
        /// <returns>Lista de casos del cliente.</returns>
        [HttpGet("por-cliente/{idCliente}")]
        public async Task<IActionResult> GetPorCliente(int idCliente)
        {
            var casos = await _service.FiltrarPorClienteAsync(idCliente);
            return Ok(casos);
        }

        /// <summary>
        /// Obtiene todos los casos asociados a una inversión específica.
        /// </summary>
        /// <param name="idInversion">Identificador de la inversión.</param>
        /// <returns>Lista de casos de la inversión.</returns>
        [HttpGet("por-inversion/{idInversion}")]
        public async Task<IActionResult> GetPorInversion(int idInversion)
        {
            var casos = await _service.FiltrarPorInversionAsync(idInversion);
            return Ok(casos);
        }

        /// <summary>
        /// Obtiene todos los casos asociados a un pago específico.
        /// </summary>
        /// <param name="idPago">Identificador del pago.</param>
        /// <returns>Lista de casos relacionados al pago.</returns>
        [HttpGet("por-pago/{idPago}")]
        public async Task<IActionResult> GetPorPago(int idPago)
        {
            var casos = await _service.FiltrarPorPagoAsync(idPago);
            return Ok(casos);
        }

        /// <summary>
        /// Crea un nuevo caso.
        /// </summary>
        /// <param name="dto">Datos para la creación del caso.</param>
        /// <returns>Identificador del nuevo caso creado.</returns>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CasoCreateDTO dto)
        {
            var idCaso = await _service.CrearCasoAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = idCaso }, new { idCaso });
        }

        /// <summary>
        /// Actualiza los datos de un caso existente.
        /// </summary>
        /// <param name="id">Identificador del caso.</param>
        /// <param name="dto">Datos actualizados del caso.</param>
        /// <returns>NoContent si la actualización fue exitosa.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CasoUpdateDTO dto)
        {
            await _service.ActualizarAsync(id, dto);
            return NoContent();
        }

        /// <summary>
        /// Continúa el flujo del caso (cambio de estado o avance de proceso).
        /// </summary>
        /// <param name="id">Identificador del caso.</param>
        /// <returns>Resultado de la operación.</returns>
        [HttpPost("{id}/continuar")]
        public async Task<IActionResult> ContinuarCaso(int id)
        {
            await _service.ContinuarFlujoCasoAsync(id);
            return Ok(new { success = true });
        }

        /// <summary>
        /// Realiza un rollback de pagos asociados a un caso.
        /// </summary>
        /// <param name="dto">Datos para identificar el pago y usuario que realiza el rollback.</param>
        /// <returns>Resultado de la operación.</returns>
        [HttpPost("rollback-pagos")]
        public async Task<IActionResult> RollbackPagos([FromBody] RollbackPagosDTO dto)
        {
            // dto debe tener { idPago, idUsuarioModificacion }
            await _service.RollbackPagosPorIdPagoAsync(dto.IdPago, dto.IdUsuarioModificacion);
            return Ok(new { success = true });
        }
    }

    /// <summary>
    /// DTO auxiliar para rollback de pagos en casos.
    /// </summary>
    public class RollbackPagosDTO
    {
        /// <summary>
        /// Identificador del pago.
        /// </summary>
        public int IdPago { get; set; }

        /// <summary>
        /// Identificador del usuario que realiza la modificación.
        /// </summary>
        public int IdUsuarioModificacion { get; set; }
    }
}
