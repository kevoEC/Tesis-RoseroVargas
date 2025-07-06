using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Models.Vistas;
using ProductoModel = Backend_CrmSG.Models.Catalogos.Producto.Producto;

namespace Backend_CrmSG.Services.Producto
{
    public interface IProductoService
    {
        Task<IEnumerable<ProductoModel>> GetAllProductosAsync();
        Task<ProductoModel> GetProductoByIdAsync(int id);
        Task<IEnumerable<ConfiguracionesProducto>> GetConfiguracionesByProductoIdAsync(int idProducto);

        // CRUD
        Task<int> CreateProductoAsync(ProductoModel producto);
        Task<bool> UpdateProductoAsync(int id, ProductoModel model);
        Task<bool> DeleteProductoAsync(int id);

        // Métodos para mostrar los datos de la vista avanzada (con nombres FK, usuarios, etc.)
        Task<IEnumerable<ProductoView>> GetAllProductosVistaAsync();
        Task<ProductoView> GetProductoVistaByIdAsync(int id);
    }
}
