using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Entidad.Adendum;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdendumController : ControllerBase
    {
        private readonly IAdendumService _adendumService;
        private readonly AppDbContext _context;

        public AdendumController(IAdendumService adendumService, AppDbContext context)
        {
            _adendumService = adendumService;
            _context = context;
        }

        // 1. Crear un nuevo adendum
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
                    inner = ex.InnerException?.Message,     // <-- Añade esto
                    stack = ex.StackTrace                   // (opcional, solo en desarrollo)
                });
            }
        }


        // 2. Actualizar un adendum (estado, proyección incremento, etc)
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

        // 3. Obtener detalle de adendum por ID
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

        // 4. Obtener lista de adendums por inversión
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

        // 5. Generar documentos para un adendum (cambia flag en adendum)
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

        // 6. Continuar flujo (activar proyección y cronograma)
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

        // GET /api/adendum/{id}/detalle-completo
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
