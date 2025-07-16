using Backend_CrmSG.DTOs.Pago;
using PagoEntity = Backend_CrmSG.Models.Entidades.Pago;

public interface IPagoService
{
    Task<List<PagoEntity>> ObtenerTodosAsync();
    Task<PagoEntity?> ObtenerPorIdAsync(int id);
    Task<List<PagoEntity>> ObtenerPorCalendarioAsync(int idCalendario);
    Task<int> CrearAsync(PagoCreateDTO dto);
    Task ActualizarAsync(int id, PagoUpdateDTO dto);
    Task EliminarAsync(int id);
    Task GenerarPagosPorCalendarioAsync(int idCalendario, int idPago, int idUsuario);
    Task RollbackPagosPorIdPagoAsync(int idPago, int idUsuarioModificacion);
}
