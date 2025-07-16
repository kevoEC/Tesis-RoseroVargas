namespace Backend_CrmSG.Services.Entidad.Adendum
{
    using Backend_CrmSG.DTOs;

    public interface IAdendumService
    {
        Task<AdendumDetalleDto> CrearAdendumAsync(AdendumCreateDto dto);
        Task<AdendumDetalleDto> ActualizarAdendumAsync(AdendumUpdateDto dto);
        Task<AdendumDetalleDto> ObtenerAdendumPorIdAsync(int idAdendum);
        Task<List<AdendumDetalleDto>> ObtenerAdendumsPorInversionAsync(int idInversion);

        Task<bool> GenerarDocumentosAsync(int idAdendum, int idUsuario);
        Task<bool> ContinuarFlujoAsync(int idAdendum, int idUsuario);
        Task<AdendumFullDetalleDto> ObtenerDetalleCompletoAsync(int idAdendum);
        Task<AdendumDetalleDto> SetIncrementoAsync(AdendumSetIncrementoDto dto);


    }

}
