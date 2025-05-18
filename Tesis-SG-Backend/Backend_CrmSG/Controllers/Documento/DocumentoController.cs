using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Documento;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend_CrmSG.Controllers.Documento
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 opcional mientras pruebas
    public class DocumentoController : ControllerBase
    {
        private readonly IDocumentoService _documentoService;

        public DocumentoController(IDocumentoService documentoService)
        {
            _documentoService = documentoService;
        }

        // 1. Listar documentos de una entidad (Solicitud, Tarea, Inversión)
        [HttpGet("entidad")]
        public async Task<IActionResult> ObtenerDocumentosPorEntidad([FromQuery] string tipoEntidad, [FromQuery] int idEntidad)
        {
            try
            {
                var documentos = await _documentoService.ObtenerDocumentosPorEntidadAsync(tipoEntidad, idEntidad);

                return Ok(new
                {
                    success = true,
                    documentos
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Error al obtener documentos requeridos.",
                    details = ex.Message
                });
            }
        }

        // 2. Crear un nuevo documento (Subir archivo)
        [HttpPost]
        public async Task<IActionResult> CrearDocumento([FromBody] DocumentoCargaDto dto)
        {
            var creado = await _documentoService.CrearDocumentoAsync(dto);

            if (!creado)
                return BadRequest(new { success = false, message = "No se pudo crear el documento." });

            return Ok(new { success = true, message = "Documento creado correctamente." });
        }

        // 3. Actualizar un documento existente
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarDocumento(int id, [FromBody] DocumentoCargaDto dto)
        {
            var actualizado = await _documentoService.ActualizarDocumentoAsync(id, dto);

            if (!actualizado)
                return NotFound(new { success = false, message = "Documento no encontrado o no se pudo actualizar." });

            return Ok(new { success = true, message = "Documento actualizado correctamente." });
        }

        // 4. Desactivar (eliminar lógico) un documento
        [HttpDelete("{id}")]
        public async Task<IActionResult> DesactivarDocumento(int id)
        {
            var desactivado = await _documentoService.DesactivarDocumentoAsync(id);

            if (!desactivado)
                return NotFound(new { success = false, message = "Documento no encontrado o no se pudo desactivar." });

            return Ok(new { success = true, message = "Documento desactivado correctamente." });
        }

        // 5. Eliminar documentos automáticos por motivo (rollback)
        [HttpDelete("motivo/{idMotivo}")]
        public async Task<IActionResult> EliminarDocumentosPorMotivo(int idMotivo, [FromQuery] int? idTarea, [FromQuery] int? idSolicitudInversion, [FromQuery] int? idInversion)
        {
            var eliminado = await _documentoService.EliminarDocumentosPorMotivoAsync(idMotivo, idTarea, idSolicitudInversion, idInversion);

            if (!eliminado)
                return BadRequest(new { success = false, message = "No se pudieron eliminar documentos por motivo." });

            return Ok(new { success = true, message = "Documentos eliminados correctamente por motivo." });
        }

        [HttpPost("motivo")]
        public async Task<IActionResult> CrearDocumentosPorMotivo([FromBody] DocumentoMotivoDto dto)
        {
            var creado = await _documentoService.CrearDocumentosPorMotivoAsync(
                dto.IdMotivo,
                dto.IdTarea,
                dto.IdSolicitudInversion,
                dto.IdInversion
            );

            if (!creado)
                return BadRequest(new { success = false, message = "No se pudieron crear documentos por motivo." });

            return Ok(new { success = true, message = "Documentos creados correctamente." });
        }

        [HttpPut("{id}/archivo")]
        public async Task<IActionResult> ActualizarArchivo(int id, [FromBody] DocumentoActualizarDto dto)
        {
            var actualizado = await _documentoService.ActualizarArchivoAsync(id, dto);

            if (!actualizado)
                return NotFound(new { success = false, message = "Documento no encontrado o no se pudo actualizar." });

            return Ok(new { success = true, message = "Archivo del documento actualizado correctamente." });
        }

        [HttpGet("{id}/vista")]
        public async Task<IActionResult> ObtenerDesdeVistaPorId(int id)
        {
            var documento = await _documentoService.ObtenerDesdeVistaPorIdAsync(id);

            if (documento == null)
                return NotFound(new { success = false, message = "Documento no encontrado." });

            return Ok(new { success = true, documento });
        }

        [HttpGet("por-solicitud-y-motivo")]
        public async Task<IActionResult> ObtenerPorSolicitudYMotivo([FromQuery] int idSolicitudInversion, [FromQuery] int idMotivo)
        {
            var documentos = await _documentoService.ObtenerPorSolicitudYMotivoAsync(idSolicitudInversion, idMotivo);
            return Ok(new { success = true, data = documentos });
        }
    }
}
