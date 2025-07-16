using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Entidad.Adendum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de adendums de inversión.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdendumController : ControllerBase
    {
        private readonly IAdendumService _adendumService;
        private readonly AppDbContext _context;

        /// <summary>
        /// Constructor del controlador Adendum.
        /// </summary>
        /// <param name="adendumService">Servicio de lógica de adendum.</param>
        /// <param name="context">Contexto de base de datos.</param>
        public AdendumController(IAdendumService adendumService, AppDbContext context)
        {
            _adendumService = adendumService;
            _context = context;
        }

        /// <summary>
        /// Crea un nuevo adendum.
        /// </summary>
        /// <param name="dto">DTO con los datos para crear el adendum.</param>
        /// <returns>El adendum creado.</returns>
        /// <response code="200">Adendum creado exitosamente.</response>
        /// <response code="400">Datos inválidos o error en la creación.</response>
        [HttpPost]
        public async Task<IActionResult> Crear([FromBody] AdendumCreateDto dto)
        {
            try
            {
                var adendum = await _adendumService.CrearAdendumAsync(dto);
                return Ok(new { success = true, adendum });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message,
                    inner = ex.InnerException?.Message,
                    stack = ex.StackTrace
                });
            }
        }

        /// <summary>
        /// Actualiza un adendum existente.
        /// </summary>
        /// <param name="dto">DTO con los datos actualizados del adendum.</param>
        /// <returns>El adendum actualizado.</returns>
        /// <response code="200">Adendum actualizado correctamente.</response>
        /// <response code="400">Datos inválidos o error en la actualización.</response>
        [HttpPut]
        public async Task<IActionResult> Actualizar([FromBody] AdendumUpdateDto dto)
        {
            try
            {
                var adendum = await _adendumService.ActualizarAdendumAsync(dto);
                return Ok(new { success = true, adendum });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el detalle de un adendum por su identificador.
        /// </summary>
        /// <param name="id">Identificador del adendum.</param>
        /// <returns>Detalle del adendum.</returns>
        /// <response code="200">Adendum encontrado.</response>
        /// <response code="404">Adendum no encontrado.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerPorId(int id)
        {
            try
            {
                var adendum = await _adendumService.ObtenerAdendumPorIdAsync(id);
                return Ok(new { success = true, adendum });
            }
            catch (Exception ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene la lista de adendums asociados a una inversión.
        /// </summary>
        /// <param name="idInversion">Identificador de la inversión.</param>
        /// <returns>Lista de adendums de la inversión.</returns>
        /// <response code="200">Lista de adendums encontrada.</response>
        /// <response code="400">Error en la consulta.</response>
        [HttpGet("por-inversion/{idInversion}")]
        public async Task<IActionResult> ObtenerPorInversion(int idInversion)
        {
            try
            {
                var adendums = await _adendumService.ObtenerAdendumsPorInversionAsync(idInversion);
                return Ok(new { success = true, adendums });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Genera los documentos asociados a un adendum.
        /// </summary>
        /// <param name="id">Identificador del adendum.</param>
        /// <param name="idUsuario">Identificador del usuario que genera los documentos.</param>
        /// <returns>Resultado de la generación de documentos.</returns>
        /// <response code="200">Documentos generados correctamente.</response>
        /// <response code="400">Error al generar los documentos.</response>
        [HttpPost("{id}/generar-documentos")]
        public async Task<IActionResult> GenerarDocumentos(int id, [FromQuery] int idUsuario)
        {
            try
            {
                var result = await _adendumService.GenerarDocumentosAsync(id, idUsuario);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Continúa el flujo del adendum (activar proyección y cronograma).
        /// </summary>
        /// <param name="id">Identificador del adendum.</param>
        /// <param name="idUsuario">Identificador del usuario que continúa el flujo.</param>
        /// <returns>Resultado de la operación.</returns>
        /// <response code="200">Flujo continuado correctamente.</response>
        /// <response code="400">Error al continuar el flujo.</response>
        [HttpPost("{id}/continuar-flujo")]
        public async Task<IActionResult> ContinuarFlujo(int id, [FromQuery] int idUsuario)
        {
            try
            {
                var result = await _adendumService.ContinuarFlujoAsync(id, idUsuario);
                return Ok(new { success = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el detalle completo de un adendum.
        /// </summary>
        /// <param name="id">Identificador del adendum.</param>
        /// <returns>Detalle completo del adendum.</returns>
        /// <response code="200">Detalle completo encontrado.</response>
        /// <response code="404">Adendum no encontrado.</response>
        [HttpGet("{id}/detalle-completo")]
        public async Task<IActionResult> ObtenerDetalleCompleto(int id)
        {
            try
            {
                var detalle = await _adendumService.ObtenerDetalleCompletoAsync(id);
                return Ok(new { success = true, detalle });
            }
            catch (Exception ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Asigna el incremento a un adendum.
        /// </summary>
        /// <param name="dto">DTO con los datos de incremento del adendum.</param>
        /// <returns>Adendum actualizado con el incremento.</returns>
        /// <response code="200">Incremento asignado correctamente.</response>
        /// <response code="400">Error al asignar el incremento.</response>
        [HttpPut("set-incremento")]
        public async Task<IActionResult> SetIncremento([FromBody] AdendumSetIncrementoDto dto)
        {
            try
            {
                var result = await _adendumService.SetIncrementoAsync(dto);
                return Ok(new { success = true, adendum = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene los documentos asociados a un adendum.
        /// </summary>
        /// <param name="idAdendum">Identificador del adendum.</param>
        /// <returns>Lista de documentos del adendum.</returns>
        /// <response code="200">Lista de documentos encontrada.</response>
        /// <response code="400">Error al obtener los documentos.</response>
        [HttpGet("por-adendum/{idAdendum}")]
        public async Task<IActionResult> ObtenerDocumentosPorAdendum(int idAdendum)
        {
            try
            {
                var documentos = await _context.Documento
                    .Where(d => d.IdAdendum == idAdendum)
                    .Select(d => new
                    {
                        d.IdDocumento,
                        d.IdTipoDocumento,
                        d.DocumentoNombre,
                        ArchivoBase64 = d.Archivo != null ? Convert.ToBase64String(d.Archivo) : null,
                        d.IdInversion,
                        d.FechaCreacion,
                        d.Activo,
                        d.Observaciones,
                        d.IdTarea,
                        d.IdSolicitudInversion,
                        d.IdAdendum
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    documentos
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
