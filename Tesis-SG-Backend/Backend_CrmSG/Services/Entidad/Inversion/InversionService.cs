using Backend_CrmSG.Data;
using Backend_CrmSG.Models.Vistas;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Services.Entidad.Inversion
{
    public class InversionService : IInversionService
    {
        private readonly AppDbContext _context;
        public InversionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<InversionDetalle>> ObtenerTodasAsync()
            => await _context.InversionDetalle.ToListAsync();

        public async Task<InversionDetalle?> ObtenerPorIdAsync(int id)
            => await _context.InversionDetalle.FirstOrDefaultAsync(x => x.IdInversion == id);

        public async Task<List<InversionDetalle>> ObtenerPorPropietarioAsync(int idUsuarioPropietario)
            => await _context.InversionDetalle
                    .Where(x => x.IdUsuarioPropietario == idUsuarioPropietario)
                    .ToListAsync();
    }

}
