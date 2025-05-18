using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Vistas;

namespace Backend_CrmSG.Services.Entidad
{
    public interface ITareaService
    {
        Task<List<TareaDetalle>> ObtenerTodas();
        Task<List<TareaDetalle>> ObtenerPorRol(int idRol);
        Task<TareaDetalle?> ObtenerDetallePorId(int idTarea);
        Task Actualizar(int idTarea, TareaUpdateDTO dto, int idUsuario);
        Task<List<TareaDetalle>> ObtenerPorSolicitudAsync(int idSolicitudInversion);

    }

}
