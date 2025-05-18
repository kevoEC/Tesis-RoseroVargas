using Backend_CrmSG.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend_CrmSG.Services.Documento
{
    public interface IDocumentoService
    {
        Task<List<DocumentoAdjuntoDto>> ObtenerDocumentosPorEntidadAsync(string tipoEntidad, int idEntidad);
        Task<bool> CrearDocumentosPorMotivoAsync(int idMotivo, int? idTarea = null, int? idSolicitudInversion = null, int? idInversion = null);
        Task<bool> EliminarDocumentosPorMotivoAsync(int idMotivo, int? idTarea = null, int? idSolicitudInversion = null, int? idInversion = null);
        Task<bool> CrearDocumentoAsync(DocumentoCargaDto dto);
        Task<bool> ActualizarDocumentoAsync(int idDocumento, DocumentoCargaDto dto);
        Task<bool> DesactivarDocumentoAsync(int idDocumento);
        Task<bool> ActualizarArchivoAsync(int idDocumento, DocumentoActualizarDto dto);
        Task<DocumentoAdjuntoDto?> ObtenerDesdeVistaPorIdAsync(int idDocumento);
        Task<List<DocumentoAdjuntoDto>> ObtenerPorSolicitudYMotivoAsync(int idSolicitudInversion, int idMotivo);

    }
}
