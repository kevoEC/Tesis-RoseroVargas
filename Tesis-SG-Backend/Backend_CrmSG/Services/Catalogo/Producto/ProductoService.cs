using Backend_CrmSG.Models;
using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProductoModel = Backend_CrmSG.Models.Catalogos.Producto.Producto;
using Backend_CrmSG.Data;

namespace Backend_CrmSG.Services.Producto
{
    public class ProductoService : IProductoService
    {
        private readonly IRepository<ProductoModel> _productoRepository;
        private readonly IRepository<ConfiguracionesProducto> _configuracionesRepository;
        private readonly AppDbContext _context;

        public ProductoService(
            IRepository<ProductoModel> productoRepository,
            IRepository<ConfiguracionesProducto> configuracionesRepository,
            AppDbContext context)
        {
            _productoRepository = productoRepository;
            _configuracionesRepository = configuracionesRepository;
            _context = context;
        }

        // --- Métodos originales ---
        public async Task<IEnumerable<ProductoModel>> GetAllProductosAsync()
        {
            return await _productoRepository.GetAllAsync();
        }

        public async Task<ProductoModel> GetProductoByIdAsync(int id)
        {
            return await _productoRepository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<ConfiguracionesProducto>> GetConfiguracionesByProductoIdAsync(int idProducto)
        {
            var all = await _configuracionesRepository.GetAllAsync();
            return all.Where(c => c.IdProducto == idProducto);
        }

        // --- Métodos CRUD ---
        public async Task<int> CreateProductoAsync(ProductoModel producto)
        {
            await _productoRepository.AddAsync(producto);
            return producto.IdProducto;
        }

        public async Task<bool> UpdateProductoAsync(int id, ProductoModel model)
        {
            var producto = await _productoRepository.GetByIdAsync(id);
            if (producto == null)
                return false;

            // Actualiza solo los campos editables...
            producto.ProductoNombre = model.ProductoNombre;
            producto.NombreComercial = model.NombreComercial;
            producto.ProductoCodigo = model.ProductoCodigo;
            producto.Iniciales = model.Iniciales;
            producto.Descripcion = model.Descripcion;
            producto.IdFormaPago = model.IdFormaPago;
            producto.Periocidad = model.Periocidad;
            producto.MontoMinimoIncremento = model.MontoMinimoIncremento;
            producto.Penalidad = model.Penalidad;
            producto.IdUsuarioModificacion = model.IdUsuarioModificacion;
            producto.FechaModificacion = DateTime.Now;

            await _productoRepository.UpdateAsync(producto);
            return true;
        }

        public async Task<bool> DeleteProductoAsync(int id)
        {
            var producto = await _productoRepository.GetByIdAsync(id);
            if (producto == null)
                return false;

            await _productoRepository.DeleteAsync(id);
            return true;
        }


        // --- Métodos para mostrar datos de la vista avanzada (ProductoView) ---
        public async Task<IEnumerable<ProductoView>> GetAllProductosVistaAsync()
        {
            return await _context.ProductosVista.ToListAsync();
        }

        public async Task<ProductoView> GetProductoVistaByIdAsync(int id)
        {
            var producto = await _context.ProductosVista.FirstOrDefaultAsync(p => p.IdProducto == id);
            if (producto == null)
                throw new KeyNotFoundException($"ProductoView con Id {id} no encontrado.");
            return producto;
        }

    }
}
