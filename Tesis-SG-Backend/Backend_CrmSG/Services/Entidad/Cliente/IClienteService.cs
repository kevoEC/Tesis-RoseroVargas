using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Vistas;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend_CrmSG.Services.Entidad
{
    public interface IClienteService
    {
        // Vistas enriquecidas (GET)
        Task<List<ClienteDetalle>> ObtenerTodosAsync();
        Task<ClienteDetalle?> ObtenerPorIdAsync(int id);
        Task<List<ClienteDetalle>> ObtenerPorPropietarioAsync(int idUsuarioPropietario);

        // Update agrupado (PUT)
        Task ActualizarClienteAsync(ClienteUpdateDTO dto);
    }
}
