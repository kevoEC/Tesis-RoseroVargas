using Backend_CrmSG.DTOs;

namespace Backend_CrmSG.Services.Entidad
{
    public interface ITareaService
    {
        Task<List<Tarea>> ObtenerTodas();
        Task<List<Tarea>> ObtenerPorRol(int idRol);
        Task<Tarea?> ObtenerPorId(int idTarea);
        Task Actualizar(int idTarea, TareaUpdateDTO dto, int idUsuario);

    }

}
