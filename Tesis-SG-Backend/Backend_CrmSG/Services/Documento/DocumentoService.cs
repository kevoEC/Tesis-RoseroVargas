using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Documentos;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Services.Documento
{
    public class DocumentoService : IDocumentoService
    {
        private readonly AppDbContext _context;

        public DocumentoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<DocumentoAdjuntoDto>> ObtenerDocumentosPorEntidadAsync(string tipoEntidad, int idEntidad)
        {
            // Puedes crear una vista o procedimiento que devuelva detalles completos
            var result = await _context.Database
                .SqlQuery<DocumentoAdjuntoDto>($"EXEC dbo.sp_ListarDocumentosPorEntidad {tipoEntidad}, {idEntidad}")
                .ToListAsync();

            return result;
        }

        public async Task<bool> CrearDocumentosPorMotivoAsync(int idMotivo, int? idTarea = null, int? idSolicitudInversion = null, int? idInversion = null)
        {
            if (idTarea == null && idSolicitudInversion == null && idInversion == null)
                throw new ArgumentException("Debe proporcionar al menos un identificador: idTarea, idSolicitudInversion o idInversion.");

            try
            {
                var sql = $"EXEC dbo.sp_CrearDocumentosPorMotivo @IdMotivo = {idMotivo}, " +
                          $"@IdTarea = {(idTarea.HasValue ? idTarea.Value.ToString() : "NULL")}, " +
                          $"@IdSolicitudInversion = {(idSolicitudInversion.HasValue ? idSolicitudInversion.Value.ToString() : "NULL")}, " +
                          $"@IdInversion = {(idInversion.HasValue ? idInversion.Value.ToString() : "NULL")}";

                await _context.Database.ExecuteSqlRawAsync(sql);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> EliminarDocumentosPorMotivoAsync(int idMotivo, int? idTarea = null, int? idSolicitudInversion = null, int? idInversion = null)
        {
            if (idTarea == null && idSolicitudInversion == null && idInversion == null)
                throw new ArgumentException("Debe proporcionar al menos un identificador.");

            try
            {
                var sql = $"EXEC dbo.sp_EliminarDocumentosPorMotivo @IdMotivo = {idMotivo}, " +
                          $"@IdTarea = {(idTarea.HasValue ? idTarea.Value.ToString() : "NULL")}, " +
                          $"@IdSolicitudInversion = {(idSolicitudInversion.HasValue ? idSolicitudInversion.Value.ToString() : "NULL")}, " +
                          $"@IdInversion = {(idInversion.HasValue ? idInversion.Value.ToString() : "NULL")}";

                await _context.Database.ExecuteSqlRawAsync(sql);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CrearDocumentoAsync(DocumentoCargaDto dto)
        {
            try
            {
                var nuevo = new Models.Documentos.Documento
                {
                    IdTipoDocumento = dto.IdTipoDocumento,
                    DocumentoNombre = dto.DocumentoNombre,
                    Archivo = Convert.FromBase64String(dto.Base64Contenido),
                    IdTarea = dto.IdTarea,
                    IdSolicitudInversion = dto.IdSolicitudInversion,
                    IdInversion = dto.IdInversion,
                    FechaCreacion = DateTime.Now,
                    Activo = true,
                    Observaciones = dto.Observaciones
                };

                _context.Documento.Add(nuevo);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ActualizarDocumentoAsync(int idDocumento, DocumentoCargaDto dto)
        {
            var documento = await _context.Documento.FindAsync(idDocumento);
            if (documento == null || !documento.Activo)
                return false;

            try
            {
                documento.DocumentoNombre = dto.DocumentoNombre;
                documento.Archivo = Convert.FromBase64String(dto.Base64Contenido);
                documento.Observaciones = dto.Observaciones;

                _context.Documento.Update(documento);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DesactivarDocumentoAsync(int idDocumento)
        {
            var documento = await _context.Documento.FindAsync(idDocumento);
            if (documento == null)
                return false;

            try
            {
                documento.Activo = false;
                _context.Documento.Update(documento);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ActualizarArchivoAsync(int idDocumento, DocumentoActualizarDto dto)
        {
            var documento = await _context.Documento.FindAsync(idDocumento);
            if (documento == null || !documento.Activo)
                return false;

            try
            {
                if (!string.IsNullOrWhiteSpace(dto.Base64Contenido))
                    documento.Archivo = Convert.FromBase64String(dto.Base64Contenido);

                if (!string.IsNullOrWhiteSpace(dto.Observaciones))
                    documento.Observaciones = dto.Observaciones;

                _context.Documento.Update(documento);
                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<DocumentoAdjuntoDto?> ObtenerDesdeVistaPorIdAsync(int idDocumento)
        {
            return await _context.DocumentosAdjuntos
                .Where(d => d.IdDocumento == idDocumento)
                .Select(d => new DocumentoAdjuntoDto
                {
                    IdDocumento = d.IdDocumento,
                    TipoDocumentoNombre = d.TipoDocumentoNombre ?? "",
                    MotivoNombre = d.MotivoNombre,
                    IdTarea = d.IdTarea,
                    IdSolicitudInversion = d.IdSolicitudInversion,
                    IdInversion = d.IdInversion,
                    FechaCreacion = d.FechaCreacion,
                    PermitirDuplicados = d.PermitirDuplicados,
                    CopiarInversion = d.CopiarInversion,
                    IdTipoArchivo = d.IdTipoArchivo,
                    Archivo = d.Archivo
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<DocumentoAdjuntoDto>> ObtenerPorSolicitudYMotivoAsync(int idSolicitudInversion, int idMotivo)
        {
            return await _context.DocumentosAdjuntos
                .Where(d =>
                    d.IdSolicitudInversion == idSolicitudInversion &&
                    d.IdMotivo == idMotivo)
                .Select(d => new DocumentoAdjuntoDto
                {
                    IdDocumento = d.IdDocumento,
                    IdTipoDocumento = d.IdTipoDocumento,
                    TipoDocumentoNombre = d.TipoDocumentoNombre,
                    CodigoTipoDocumento = d.CodigoTipoDocumento,
                    IdMotivo = d.IdMotivo,
                    MotivoNombre = d.MotivoNombre,
                    IdTarea = d.IdTarea,
                    IdSolicitudInversion = d.IdSolicitudInversion,
                    IdInversion = d.IdInversion,
                    FechaCreacion = d.FechaCreacion,
                    PermitirDuplicados = d.PermitirDuplicados,
                    CopiarInversion = d.CopiarInversion,
                    IdTipoArchivo = d.IdTipoArchivo
                })
                .ToListAsync();
        }




    }
}
