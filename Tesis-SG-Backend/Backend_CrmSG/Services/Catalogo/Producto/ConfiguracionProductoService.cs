using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Catalogos.Producto;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.Repositories;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Backend_CrmSG.Services.Producto
{
    public class ConfiguracionProductoService : IConfiguracionProductoService
    {
        private readonly IRepository<ConfiguracionesProducto> _repository;
        private readonly AppDbContext _context;
        private readonly string _connectionString;

        public ConfiguracionProductoService(IRepository<ConfiguracionesProducto> repository, IConfiguration configuration, AppDbContext context)
        {
            _repository = repository;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("La cadena de conexión 'DefaultConnection' no está configurada.");
            _context = context;
        }

        public async Task<IEnumerable<ConfiguracionProductoDto>> GetConfiguracionesByProductoAsync(int idProducto)
        {
            var configuraciones = new List<ConfiguracionProductoDto>();

            using var connection = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                SELECT 
                    cp.IdConfiguraciones,
                    cp.MontoMinimo,
                    cp.MontoMaximo,
                    cp.Plazo,
                    cp.Taza,
                    cp.IdOrigen,
                    cp.CosteOperativoEEUU,
                    cp.IdTipoTasa,
                    cp.IdProducto,
                    o.Nombre AS NombreOrigen,
                    tt.TipoTasaNombre AS NombreTipoTasa
                FROM ConfiguracionesProducto cp
                INNER JOIN OrigenProducto o ON cp.IdOrigen = o.IdOrigen
                INNER JOIN TipoTasa tt ON cp.IdTipoTasa = tt.IdTipoTasa
                WHERE cp.IdProducto = @IdProducto
                ORDER BY cp.Plazo, cp.MontoMinimo", connection);

            cmd.Parameters.AddWithValue("@IdProducto", idProducto);

            await connection.OpenAsync();
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                configuraciones.Add(new ConfiguracionProductoDto
                {
                    IdConfiguraciones = reader.GetInt32(0),
                    MontoMinimo = reader.GetDecimal(1),
                    MontoMaximo = reader.GetDecimal(2),
                    Plazo = reader.GetInt16(3),
                    Taza = reader.GetDecimal(4),
                    IdOrigen = reader.GetInt32(5),
                    CosteOperativoEEUU = reader.IsDBNull(6) ? null : reader.GetDecimal(6),
                    IdTipoTasa = reader.GetInt32(7),
                    IdProducto = reader.GetInt32(8),
                    NombreOrigen = reader.GetString(9),
                    NombreTipoTasa = reader.GetString(10)
                });
            }

            return configuraciones;
        }

        public async Task<ConfiguracionesProducto> CreateAsync(ConfiguracionesProducto configuracion)
        {
            _context.ConfiguracionesProducto.Add(configuracion);
            await _context.SaveChangesAsync();
            return configuracion; // Ya con ID generado
        }

        public async Task<ConfiguracionesProducto?> UpdateAsync(int id, ConfiguracionesProducto configuracion)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return null;

            configuracion.IdConfiguraciones = id;
            await _repository.UpdateAsync(configuracion);
            return configuracion;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
            return true;
        }

        public async Task<ConfiguracionesProducto?> GetByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<ConfiguracionProductoView>> GetAllConfiguracionesVistaAsync()
        {
            return await _context.ConfiguracionesProductoVista.ToListAsync();
        }

        public async Task<ConfiguracionProductoView?> GetConfiguracionVistaByIdAsync(int id)
        {
            return await _context.ConfiguracionesProductoVista
                .FirstOrDefaultAsync(x => x.IdConfiguraciones == id);
        }

        public async Task<IEnumerable<ConfiguracionProductoView>> GetVistaByProductoIdAsync(int idProducto)
        {
            return await _context.ConfiguracionesProductoVista
                .Where(c => c.IdProducto == idProducto)
                .ToListAsync();
        }
    }
}