using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.DTOs.Pago;
using Backend_CrmSG.Repositories;
using Backend_CrmSG.Data;
using Microsoft.EntityFrameworkCore;
using PagoEntity = Backend_CrmSG.Models.Entidades.Pago;



namespace Backend_CrmSG.Services.Entidad.Pago
{
    public class PagoService : IPagoService
    {
        private readonly IRepository<PagoEntity> _repo;
        private readonly AppDbContext _context;
        private readonly StoredProcedureService _spService;

        public PagoService(IRepository<PagoEntity> repo, AppDbContext context, StoredProcedureService spService)
        {
            _repo = repo;
            _context = context;
            _spService = spService;
        }

        public async Task<List<PagoEntity>> ObtenerTodosAsync()
            => (await _repo.GetAllAsync()).ToList();



        public async Task<PagoEntity?> ObtenerPorIdAsync(int id)
            => await _repo.GetByIdAsync(id);

        public async Task<List<PagoEntity>> ObtenerPorCalendarioAsync(int idCalendario)
            => await _context.Pago
                    .Where(x => x.IdCalendario == idCalendario)
                    .ToListAsync();

        public async Task<int> CrearAsync(PagoCreateDTO dto)
        {
            var pago = new PagoEntity
            {
                IdCalendario = dto.IdCalendario,
                CantidadPagos = dto.CantidadPagos,
                DescartarPagos = dto.DescartarPagos,
                GenerarPagos = dto.GenerarPagos,
                Detalle = dto.Detalle,
                ConfirmarRegistrosPagos = dto.ConfirmarRegistrosPagos,
                FechaCreacion = DateTime.Now,
                IdUsuarioCreacion = dto.IdUsuarioCreacion,
                IdUsuarioPropietario = dto.IdUsuarioPropietario
            };
            await _repo.AddAsync(pago);
            return pago.IdPago;
        }

        public async Task ActualizarAsync(int id, PagoUpdateDTO dto)
        {
            var pago = await _repo.GetByIdAsync(id);
            if (pago == null)
                throw new KeyNotFoundException("No existe el pago");

            pago.CantidadPagos = dto.CantidadPagos;
            pago.DescartarPagos = dto.DescartarPagos;
            pago.GenerarPagos = dto.GenerarPagos;
            pago.Detalle = dto.Detalle;
            pago.ConfirmarRegistrosPagos = dto.ConfirmarRegistrosPagos;
            pago.FechaModificacion = DateTime.Now;
            pago.IdUsuarioModificacion = dto.IdUsuarioModificacion;
            pago.IdUsuarioPropietario = dto.IdUsuarioPropietario;

            await _repo.UpdateAsync(pago);
        }

        public async Task EliminarAsync(int id)
        {
            await _repo.DeleteAsync(id);
        }

        // Llama al SP de generación automática de pagos/casos
        public async Task GenerarPagosPorCalendarioAsync(int idCalendario, int idPago, int idUsuario)
        {
            await _spService.GenerarPagosPorCalendarioAsync(idCalendario, idPago, idUsuario);
        }

        public async Task RollbackPagosPorIdPagoAsync(int idPago, int idUsuarioModificacion)
        {
            await _spService.EjecutarRollbackPagosPorIdPago(idPago, idUsuarioModificacion);
        }

    }
}
