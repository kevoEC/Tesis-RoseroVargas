using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Models.Vistas;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend_CrmSG.Services.Entidad
{
    public class TareaService : ITareaService
    {
        private readonly AppDbContext _context;
        private readonly StoredProcedureService _storedProcedureService;

        public TareaService(AppDbContext context, StoredProcedureService storedProcedureService)
        {
            _context = context;
            _storedProcedureService = storedProcedureService;
        }

        // ✅ Obtener todas las tareas desde la vista enriquecida
        public async Task<List<TareaDetalleExtendida>> ObtenerTodas()
        {
            return await _context.TareasDetalle.ToListAsync();
        }

        // ✅ Obtener tareas filtradas por el tipo según rol
        public async Task<List<TareaDetalleExtendida>> ObtenerPorRol(int idRol)
        {
            List<int> tipoTareas = idRol switch
            {
                1 => await _context.Tarea.Select(t => t.IdTipoTarea).Distinct().ToListAsync(),
                2 or 9 => new List<int> { 4 },
                3 => new List<int> { 2 },
                4 => new List<int> { 6 },
                5 => new List<int> { 1, 3 },
                6 => new List<int> { 5, 6 },
                _ => new List<int>()
            };

            if (!tipoTareas.Any())
                return new List<TareaDetalleExtendida>();

            return await _context.TareasDetalle
                .Where(t => tipoTareas.Contains(t.IdTipoTarea))
                .ToListAsync();
        }

        // ✅ Obtener tareas vinculadas a una solicitud
        public async Task<List<TareaDetalleExtendida>> ObtenerPorSolicitudAsync(int idSolicitudInversion)
        {
            return await _context.TareasDetalle
                .Where(t => t.IdSolicitudInversion == idSolicitudInversion)
                .ToListAsync();
        }

        // ✅ Obtener detalle dinámico de una tarea
        public async Task<TareaDetalleDinamicoDTO?> ObtenerDetallePorId(int idTarea)
        {
            var tarea = await _context.TareasDetalle.FirstOrDefaultAsync(t => t.IdTarea == idTarea);
            if (tarea == null) return null;

            var dto = new TareaDetalleDinamicoDTO
            {
                IdTarea = tarea.IdTarea,
                TareaNombre = tarea.TareaNombre,
                // Updated line to handle possible null reference
                Descripcion = tarea.Descripcion ?? string.Empty, // <--- Fix for CS8601
                NombreTipoTarea = tarea.NombreTipoTarea ?? "",
                IdTipoTarea = tarea.IdTipoTarea,
                IdResultado = tarea.IdResultado,
                NombreResultado = tarea.NombreResultado, // <--- Si lo tienes
                Observacion = tarea.Observación,
                IdUsuarioCreacion = tarea.IdUsuarioCreacion,
                NombreUsuarioCreacion = tarea.NombreUsuarioCreacion,
                FechaCreacion = tarea.FechaCreacion,
                IdUsuarioModificacion = tarea.IdUsuarioModificacion,
                NombreUsuarioModificacion = tarea.NombreUsuarioModificacion,
                FechaModificacion = tarea.FechaModificacion,
                IdUsuarioPropietario = tarea.IdUsuarioPropietario,
                NombreUsuarioPropietario = tarea.NombreUsuarioPropietario,
                CamposTipo = new Dictionary<string, object?>()
            };


            switch (tarea.IdTipoTarea)
            {
                case 1:
                    dto.CamposTipo["ReemplazarContrato"] = tarea.ReemplazarContrato;
                    dto.CamposTipo["ReemplazarAnexo"] = tarea.ReemplazarAnexo;
                    break;
                case 2:
                    dto.CamposTipo["ReemplazarContratoAdendum"] = tarea.ReemplazarContratoAdendum;
                    break;
                case 3:
                    dto.CamposTipo["FirmadoGerencia"] = tarea.FirmadoGerencia;
                    dto.CamposTipo["IdTipoFirma"] = tarea.IdTipoFirma;
                    break;
                case 4:
                    dto.CamposTipo["DatosTarea"] = tarea.DatosTarea;
                    break;
                case 5:
                    dto.CamposTipo["FechaOperacion"] = tarea.FechaOperacion;
                    dto.CamposTipo["CuentaAbono"] = tarea.CuentaAbono;
                    dto.CamposTipo["NumeroComprobanteAbono"] = tarea.NumeroComprobanteAbono;
                    break;
                case 6:
                    dto.CamposTipo["FechaValidacion"] = tarea.FechaValidacionRiesgo;
                    break;
            }

            return dto;
        }

        // ✅ Guardar actualización dinámica: resultado + campos específicos
        public async Task ActualizarDinamico(int idTarea, TareaUpdateDinamicoDTO dto, int idUsuario)
        {
            var tarea = await _context.Tarea.FindAsync(idTarea);
            if (tarea == null)
                throw new KeyNotFoundException("Tarea no encontrada");

            tarea.IdResultado = dto.IdResultado;
            tarea.Observación = dto.Observacion;
            tarea.IdUsuarioModificacion = idUsuario;
            tarea.FechaModificacion = DateTime.Now;
            tarea.DatosEspecificos = JsonSerializer.Serialize(dto.CamposTipo);

            await _context.SaveChangesAsync();

            // 🚦 SOLO si la tarea queda en estado aprobado (1)
            if (tarea.IdResultado == 1)
            {
                // Llamar al SP usando el IdSolicitudInversion de la tarea
                var mensaje = await _storedProcedureService.EjecutarSpCrearClienteEInversionPorSolicitud(tarea.IdSolicitudInversion);

                // Opcional: puedes guardar el mensaje en logs, devolverlo, etc.
                // Ejemplo: Console.WriteLine(mensaje);
            }
        }

    }
}
