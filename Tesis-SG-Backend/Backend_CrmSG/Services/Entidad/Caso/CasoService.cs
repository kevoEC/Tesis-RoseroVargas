using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.DTOs.Caso;
using Backend_CrmSG.Repositories;
using Microsoft.EntityFrameworkCore;
using Backend_CrmSG.Data;
using CasoEntity = Backend_CrmSG.Models.Entidades.Caso;

namespace Backend_CrmSG.Services.Entidad.Caso
{
    public class CasoService : ICasoService
    {
        private readonly IRepository<CasoEntity> _repo;
        private readonly AppDbContext _context;
        private readonly StoredProcedureService _spService;

        public CasoService(IRepository<CasoEntity> repo, AppDbContext context, StoredProcedureService spService)
        {
            _repo = repo;
            _context = context;
            _spService = spService;
        }

        public async Task<List<CasoDetalleExtendida>> ObtenerTodosAsync()
            => await _context.CasosDetalleExtendida.ToListAsync();

        public async Task<CasoDetalleExtendida?> ObtenerPorIdAsync(int id)
            => await _context.CasosDetalleExtendida.FirstOrDefaultAsync(x => x.IdCaso == id);

        public async Task<List<CasoDetalleExtendida>> FiltrarPorClienteAsync(int idCliente)
            => await _context.CasosDetalleExtendida
                    .Where(x => x.IdCliente == idCliente)
                    .ToListAsync();

        public async Task<List<CasoDetalleExtendida>> FiltrarPorInversionAsync(int idInversion)
            => await _context.CasosDetalleExtendida
                    .Where(x => x.IdInversion == idInversion)
                    .ToListAsync();

        public async Task<List<CasoDetalleExtendida>> FiltrarPorPagoAsync(int idPago)
            => await _context.CasosDetalleExtendida
                    .Where(x => x.IdPago == idPago)
                    .ToListAsync();

        public async Task ActualizarAsync(int id, CasoUpdateDTO dto)
        {
            var caso = await _repo.GetByIdAsync(id);
            if (caso == null)
            {
                // DEBUG: Forzar lectura directa del contexto (bypasando repository)
                var directo = await _context.Caso.FindAsync(id);
                if (directo == null)
                {
                    throw new Exception("Ni el repo ni el contexto encontraron el caso. Revisa mapping o que el id realmente existe.");
                }
                else
                {
                    throw new Exception("El repo no encontró el caso pero el contexto sí. Revisa el mapping del repo.");
                }
            }

            caso.Descripcion = dto.Descripcion;
            caso.ContinuarCaso = dto.ContinuarCaso;
            caso.Estado = dto.Estado;
            caso.IdUsuarioModificacion = dto.IdUsuarioModificacion;
            caso.IdUsuarioPropietario = dto.IdUsuarioPropietario;
            caso.FechaModificacion = DateTime.Now;
            if (dto.DatosEspecificos != null)
                caso.DatosEspecificos = dto.DatosEspecificos;

            await _repo.UpdateAsync(caso);
        }

        public async Task<int> CrearCasoAsync(CasoCreateDTO dto)
            => await _spService.EjecutarSpCrearCaso(dto);

        public async Task ContinuarFlujoCasoAsync(int idCaso)
            => await _spService.EjecutarSpContinuarFlujoCaso(idCaso);

        public async Task RollbackPagosPorIdPagoAsync(int idPago, int idUsuarioModificacion)
            => await _spService.EjecutarRollbackPagosPorIdPago(idPago, idUsuarioModificacion);
    }
}
