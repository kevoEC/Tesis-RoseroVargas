using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Models.Vistas;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend_CrmSG.Services.Producto
{
    public interface IConfiguracionProductoService
    {
        Task<IEnumerable<ConfiguracionProductoDto>> GetConfiguracionesByProductoAsync(int idProducto);
        Task<ConfiguracionesProducto> CreateAsync(ConfiguracionesProducto configuracion);
        Task<ConfiguracionesProducto?> UpdateAsync(int id, ConfiguracionesProducto configuracion);
        Task<bool> DeleteAsync(int id);
        Task<ConfiguracionesProducto?> GetByIdAsync(int id);

        // Métodos para la vista avanzada
        Task<IEnumerable<ConfiguracionProductoView>> GetAllConfiguracionesVistaAsync();
        Task<ConfiguracionProductoView?> GetConfiguracionVistaByIdAsync(int id);
        Task<IEnumerable<ConfiguracionProductoView>> GetVistaByProductoIdAsync(int idProducto);
    }
}
