using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Documento;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controlador para gestión y manipulación de documentos (archivos) relacionados a entidades del sistema.
/// Incluye carga, edición, eliminación, consultas y descargas.
/// </summary>
namespace Backend_CrmSG.Controllers.Documento
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // 🔒 Requiere autenticación por defecto
    public class DocumentoController : ControllerBase
    {
        private readonly IDocumentoService _documentoService;
        private readonly AppDbContext _context;

        /// <summary>
        /// Constructor que inyecta los servicios necesarios para gestión de documentos.
        /// </summary>
        public DocumentoController(IDocumentoService documentoService, AppDbContext context)
        {
            _documentoService = documentoService;
            _context = context;
        }

        /// <summary>
        /// Lista los documentos asociados a una entidad (Solicitud, Tarea, Inversión, etc).
        /// </summary>
        /// <param name="tipoEntidad">Tipo de la entidad (ej: "solicitud", "tarea", "inversion").</param>
        /// <param name="idEntidad">ID de la entidad asociada.</param>
        /// <returns>Listado de documentos.</returns>
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

        /// <summary>
        /// Crea un nuevo documento (sube un archivo) asociado a una entidad.
        /// </summary>
        /// <param name="dto">Datos y archivo codificado del documento.</param>
        /// <returns>Resultado de la operación.</returns>
        [HttpPost]
        public async Task<IActionResult> CrearDocumento([FromBody] DocumentoCargaDto dto)
        {
            var creado = await _documentoService.CrearDocumentoAsync(dto);

            if (!creado)
                return BadRequest(new { success = false, message = "No se pudo crear el documento." });

            return Ok(new { success = true, message = "Documento creado correctamente." });
        }

        /// <summary>
        /// Actualiza los datos de un documento existente.
        /// </summary>
        /// <param name="id">ID del documento.</param>
        /// <param name="dto">Nuevos datos del documento.</param>
        /// <returns>Resultado de la actualización.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarDocumento(int id, [FromBody] DocumentoCargaDto dto)
        {
            var actualizado = await _documentoService.ActualizarDocumentoAsync(id, dto);

            if (!actualizado)
                return NotFound(new { success = false, message = "Documento no encontrado o no se pudo actualizar." });

            return Ok(new { success = true, message = "Documento actualizado correctamente." });
        }

        /// <summary>
        /// Elimina lógicamente (desactiva) un documento.
        /// </summary>
        /// <param name="id">ID del documento a desactivar.</param>
        /// <returns>Resultado de la operación.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DesactivarDocumento(int id)
        {
            var desactivado = await _documentoService.DesactivarDocumentoAsync(id);

            if (!desactivado)
                return NotFound(new { success = false, message = "Documento no encontrado o no se pudo desactivar." });

            return Ok(new { success = true, message = "Documento desactivado correctamente." });
        }

        /// <summary>
        /// Elimina todos los documentos automáticos asociados a un motivo (rollback).
        /// </summary>
        /// <param name="idMotivo">ID del motivo.</param>
        /// <param name="idTarea">ID de la tarea (opcional).</param>
        /// <param name="idSolicitudInversion">ID de la solicitud de inversión (opcional).</param>
        /// <param name="idInversion">ID de la inversión (opcional).</param>
        /// <returns>Resultado de la eliminación.</returns>
        [HttpDelete("motivo/{idMotivo}")]
        public async Task<IActionResult> EliminarDocumentosPorMotivo(int idMotivo, [FromQuery] int? idTarea, [FromQuery] int? idSolicitudInversion, [FromQuery] int? idInversion)
        {
            var eliminado = await _documentoService.EliminarDocumentosPorMotivoAsync(idMotivo, idTarea, idSolicitudInversion, idInversion);

            if (!eliminado)
                return BadRequest(new { success = false, message = "No se pudieron eliminar documentos por motivo." });

            return Ok(new { success = true, message = "Documentos eliminados correctamente por motivo." });
        }

        /// <summary>
        /// Crea documentos automáticos a partir de un motivo.
        /// </summary>
        /// <param name="dto">Datos necesarios para la creación de documentos por motivo.</param>
        /// <returns>Resultado de la operación.</returns>
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

        /// <summary>
        /// Actualiza solo el archivo binario de un documento (no los metadatos).
        /// </summary>
        /// <param name="id">ID del documento.</param>
        /// <param name="dto">Nuevo archivo codificado en base64 y sus metadatos.</param>
        /// <returns>Resultado de la actualización del archivo.</returns>
        [HttpPut("{id}/archivo")]
        public async Task<IActionResult> ActualizarArchivo(int id, [FromBody] DocumentoActualizarDto dto)
        {
            var actualizado = await _documentoService.ActualizarArchivoAsync(id, dto);

            if (!actualizado)
                return NotFound(new { success = false, message = "Documento no encontrado o no se pudo actualizar." });

            return Ok(new { success = true, message = "Archivo del documento actualizado correctamente." });
        }

        /// <summary>
        /// Obtiene los datos de un documento desde la vista extendida por su ID.
        /// </summary>
        /// <param name="id">ID del documento.</param>
        /// <returns>Datos extendidos del documento.</returns>
        [HttpGet("{id}/vista")]
        public async Task<IActionResult> ObtenerDesdeVistaPorId(int id)
        {
            var documento = await _documentoService.ObtenerDesdeVistaPorIdAsync(id);

            if (documento == null)
                return NotFound(new { success = false, message = "Documento no encontrado." });

            return Ok(new { success = true, documento });
        }

        /// <summary>
        /// Lista documentos filtrados por solicitud y motivo.
        /// </summary>
        /// <param name="idSolicitudInversion">ID de la solicitud de inversión.</param>
        /// <param name="idMotivo">ID del motivo.</param>
        /// <returns>Lista de documentos asociados.</returns>
        [HttpGet("por-solicitud-y-motivo")]
        public async Task<IActionResult> ObtenerPorSolicitudYMotivo([FromQuery] int idSolicitudInversion, [FromQuery] int idMotivo)
        {
            var documentos = await _documentoService.ObtenerPorSolicitudYMotivoAsync(idSolicitudInversion, idMotivo);
            return Ok(new { success = true, data = documentos });
        }

        /// <summary>
        /// Descarga el archivo físico de un documento (Word) según su ID.
        /// </summary>
        /// <param name="id">ID del documento a descargar.</param>
        /// <returns>Archivo Word del documento.</returns>
        [HttpGet("descargar/{id}")]
        public async Task<IActionResult> DescargarDocumento(int id)
        {
            var doc = await _context.Documento.FindAsync(id);
            if (doc == null || doc.Archivo == null)
                return NotFound(new { success = false, message = "Documento no encontrado o sin contenido." });

            return File(doc.Archivo,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                $"{doc.DocumentoNombre}.docx");
        }

    }
}
