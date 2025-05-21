using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Vistas;

namespace Backend_CrmSG.Services.Entidad
{
    public interface ITareaService
    {
        Task<List<TareaDetalleExtendida>> ObtenerTodas();
        Task<List<TareaDetalleExtendida>> ObtenerPorRol(int idRol);
        Task<List<TareaDetalleExtendida>> ObtenerPorSolicitudAsync(int idSolicitudInversion);

        Task<TareaDetalleDinamicoDTO?> ObtenerDetallePorId(int idTarea);
        Task ActualizarDinamico(int idTarea, TareaUpdateDinamicoDTO dto, int idUsuario);
    }
}
