using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Entidades;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Services.Entidad
{
    public class TareaService : ITareaService
    {
        private readonly AppDbContext _context;

        public TareaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Tarea>> ObtenerTodas()
        {
            return await _context.Tarea.ToListAsync();
        }

        public async Task<List<Tarea>> ObtenerPorRol(int idRol)
        {
            List<int> tipoTareas = idRol switch
            {
                1 => await _context.Tarea.Select(t => t.IdTipoTarea).Distinct().ToListAsync(), // Ver todas
                2 or 9 => new List<int> { 4 },     // Comprobante de abono
                3 => new List<int> { 2 },          // Revisión legal
                4 => new List<int> { 6 },          // Revisión por riesgo
                5 => new List<int> { 1, 3 },       // Documental + Contrato
                6 => new List<int> { 5, 6 },       // Conciliación + Riesgo
                _ => new List<int>()
            };

            if (!tipoTareas.Any())
                return new List<Tarea>();

            return await _context.Tarea
                .Where(t => tipoTareas.Contains(t.IdTipoTarea))
                .ToListAsync();
        }

        public async Task<Tarea?> ObtenerPorId(int idTarea)
        {
            return await _context.Tarea.FindAsync(idTarea);
        }

        public async Task Actualizar(int idTarea, TareaUpdateDTO dto, int idUsuario)
        {
            var tarea = await _context.Tarea.FindAsync(idTarea);
            if (tarea == null)
                throw new KeyNotFoundException("Tarea no encontrada");

            tarea.IdResultado = dto.IdResultado;
            tarea.Observación = dto.Observación;
            tarea.DatosEspecificos = dto.DatosEspecificos;
            tarea.IdUsuarioModificacion = idUsuario;
            tarea.FechaModificacion = DateTime.Now;

            await _context.SaveChangesAsync();
        }
    }
}
