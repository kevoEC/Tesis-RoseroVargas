using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.DTOs.Caso;

namespace Backend_CrmSG.Services.Entidad.Caso
{
    public interface ICasoService
    {
        Task<List<CasoDetalleExtendida>> ObtenerTodosAsync();
        Task<CasoDetalleExtendida?> ObtenerPorIdAsync(int id);
        Task<List<CasoDetalleExtendida>> FiltrarPorClienteAsync(int idCliente);
        Task<List<CasoDetalleExtendida>> FiltrarPorInversionAsync(int idInversion);
        Task<List<CasoDetalleExtendida>> FiltrarPorPagoAsync(int idPago);

        Task ActualizarAsync(int id, CasoUpdateDTO dto);

        Task<int> CrearCasoAsync(CasoCreateDTO dto);
        Task ContinuarFlujoCasoAsync(int idCaso);
        Task RollbackPagosPorIdPagoAsync(int idPago, int idUsuarioModificacion);
    }
}
