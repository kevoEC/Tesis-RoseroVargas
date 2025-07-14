using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend_CrmSG.Controllers.Entidad
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProyeccionController : ControllerBase
    {
        private readonly ProyeccionService _proyeccionService;
        private readonly AppDbContext _context;
        private readonly SimuladorProyeccionService _simulador;

        public ProyeccionController(ProyeccionService proyeccionService, AppDbContext context, SimuladorProyeccionService simulador)
        {
            _proyeccionService = proyeccionService;
            _context = context;
            _simulador = simulador;
        }

        [HttpPost]
        public async Task<IActionResult> CrearProyeccion([FromBody] ProyeccionCreateDto dto)
        {
            try
            {
                // 🔥 Ahora el IdUsuario ya viene en el DTO
                int idProyeccion = await _proyeccionService.CrearProyeccionAsync(dto, dto.IdUsuario);

                // Buscar proyección recién creada
                var proyeccion = await _context.Proyeccion
                    .FirstOrDefaultAsync(p => p.IdProyeccion == idProyeccion);

                if (proyeccion == null)
                    return NotFound(new { success = false, message = "Proyección no encontrada después de crearla." });

                // Mapear manualmente a DTO para evitar ciclos
                var proyeccionDto = new ProyeccionDetalleDto
                {
                    IdProyeccion = proyeccion.IdProyeccion,
                    ProyeccionNombre = proyeccion.ProyeccionNombre,
                    IdProducto = proyeccion.IdProducto,
                    Capital = proyeccion.Capital,
                    AporteAdicional = proyeccion.AporteAdicional,
                    Plazo = proyeccion.Plazo,
                    FechaInicial = proyeccion.FechaInicial,
                    FechaVencimiento = proyeccion.FechaVencimiento,
                    Tasa = proyeccion.Tasa,
                    CosteOperativo = proyeccion.CosteOperativo,
                    CosteNotarizacion = proyeccion.CosteNotarizacion,
                    TotalRentabilidad = proyeccion.TotalRentabilidad,
                    TotalCosteOperativo = proyeccion.TotalCosteOperativo,
                    TotalRentaPeriodo = proyeccion.TotalRentaPeriodo,
                    RendimientosMasCapital = proyeccion.RendimientosMasCapital,
                    ValorProyectadoLiquidar = proyeccion.ValorProyectadoLiquidar,
                    TotalAporteAdicional = proyeccion.TotalAporteAdicional,
                    FechaIncremento = proyeccion.FechaIncremento
                };

                // Buscar cronograma activo
                var cronogramaEntity = await _context.CronogramaProyeccion
                    .Where(c => c.IdProyeccion == idProyeccion && c.EsActivo)
                    .FirstOrDefaultAsync();

                List<CronogramaCuotaDto> cronograma = new();

                if (cronogramaEntity != null)
                {
                    cronograma = JsonSerializer.Deserialize<List<CronogramaCuotaDto>>(cronogramaEntity.PeriodosJson) ?? new List<CronogramaCuotaDto>();

                }

                return Ok(new
                {
                    success = true,
                    message = "Proyección creada correctamente.",
                    proyeccion = proyeccionDto,
                    cronograma
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Ocurrió un error en el servidor.",
                    details = ex.Message
                });
            }
        }

        [HttpGet("{id}/cronograma")]
        public async Task<IActionResult> ObtenerCronograma(int id)
        {
            try
            {
                // Intentar obtener cronograma activo primero
                var cronogramaEntity = await _context.CronogramaProyeccion
                    .Where(c => c.IdProyeccion == id && c.EsActivo)
                    .FirstOrDefaultAsync();

                // Si no hay activo, obtener cualquier cronograma (inactivo)
                if (cronogramaEntity == null)
                {
                    cronogramaEntity = await _context.CronogramaProyeccion
                        .Where(c => c.IdProyeccion == id)
                        .OrderByDescending(c => c.IdCronogramaProyeccion) // Opcional: para tomar el más reciente
                        .FirstOrDefaultAsync();
                }

                if (cronogramaEntity == null)
                    return NotFound(new { success = false, message = "Cronograma no encontrado." });

                var cronograma = JsonSerializer.Deserialize<List<CronogramaCuotaDto>>(cronogramaEntity.PeriodosJson);

                return Ok(new
                {
                    success = true,
                    idProyeccion = id,
                    cronograma
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Error al obtener cronograma.",
                    details = ex.Message
                });
            }
        }



        [HttpPut("{id}")]
        public async Task<int> ActualizarProyeccionAsync(ProyeccionUpdateDto dto)
        {
            // 1. Buscar la proyección existente
            var proyeccion = await _context.Proyeccion
                .FirstOrDefaultAsync(p => p.IdProyeccion == dto.IdProyeccionAnterior);

            if (proyeccion == null)
                throw new Exception("La proyección anterior no fue encontrada.");

            // 2. Desactivar el cronograma anterior
            var cronogramaAnterior = await _context.CronogramaProyeccion
                .FirstOrDefaultAsync(c => c.IdProyeccion == dto.IdProyeccionAnterior && c.EsActivo);

            if (cronogramaAnterior == null)
                throw new Exception("No se encontró cronograma activo asociado a la proyección anterior.");

            cronogramaAnterior.EsActivo = false;
            _context.CronogramaProyeccion.Update(cronogramaAnterior);

            // 3. Buscar producto y configuración
            var producto = await _context.Producto.FindAsync(dto.IdProducto);
            if (producto == null)
                throw new Exception("Producto no encontrado.");

            var configuracion = await _context.ConfiguracionesProducto
                .Where(c =>
                    c.IdProducto == dto.IdProducto &&
                    c.Plazo == dto.Plazo &&
                    c.IdOrigen == dto.IdOrigenCapital &&
                    dto.Capital >= c.MontoMinimo &&
                    dto.Capital <= c.MontoMaximo)
                .FirstOrDefaultAsync();

            if (configuracion == null)
                throw new Exception("No hay configuración válida para los datos ingresados.");

            // 4. Actualizar los campos de la proyección existente
            proyeccion.IdProducto = dto.IdProducto;
            proyeccion.Capital = dto.Capital;
            proyeccion.AporteAdicional = dto.AporteAdicional ?? 0;
            proyeccion.Plazo = dto.Plazo;
            proyeccion.FechaInicial = dto.FechaInicial;
            proyeccion.Tasa = configuracion.Taza;
            proyeccion.CosteOperativo = dto.CosteOperativo;
            proyeccion.CosteNotarizacion = dto.CosteNotarizacion ?? 0;
            proyeccion.IdConfiguracionesProducto = configuracion.IdConfiguraciones;
            proyeccion.IdOrigenCapital = dto.IdOrigenCapital;
            proyeccion.IdOrigenIncremento = dto.IdOrigenIncremento;
            proyeccion.IdSolicitudInversion = dto.IdSolicitudInversion;
            proyeccion.IdUsuarioModificacion = dto.IdUsuario;
            proyeccion.FechaModificacion = DateTime.Now;
            proyeccion.ProyeccionNombre = $"{producto.ProductoNombre} - ${dto.Capital} ({dto.Plazo} meses)";

            _context.Proyeccion.Update(proyeccion);

            // 5. Simular nuevo cronograma
            var simulacion = _simulador.ObtenerSimulacion(new SimulacionRequest
            {
                Capital = dto.Capital,
                Plazo = dto.Plazo,
                FechaInicial = dto.FechaInicial,
                Tasa = configuracion.Taza,
                AporteAdicional = dto.AporteAdicional ?? 0,
                CosteOperativo = dto.CosteOperativo ?? 0,
                CosteNotarizacion = dto.CosteNotarizacion ?? 0,
                IdOrigenCapital = dto.IdOrigenCapital,
                Periodicidad = producto.Periocidad
            });

            // 6. Crear nuevo cronograma
            var nuevoCronograma = new CronogramaProyeccion
            {
                IdProyeccion = proyeccion.IdProyeccion,
                PeriodosJson = JsonSerializer.Serialize(simulacion.Cronograma),
                FechaCreacion = DateTime.Now,
                EsActivo = true,
                Version = cronogramaAnterior.Version + 1
            };

            _context.CronogramaProyeccion.Add(nuevoCronograma);

            // 7. Actualizar totales de proyección
            proyeccion.TotalRentabilidad = simulacion.TotalRentabilidad;
            proyeccion.TotalCosteOperativo = simulacion.TotalCosteOperativo;
            proyeccion.TotalRentaPeriodo = simulacion.TotalRentaPeriodo;
            proyeccion.RendimientosMasCapital = simulacion.RendimientoCapital;
            proyeccion.ValorProyectadoLiquidar = simulacion.ValorProyectadoLiquidar;
            proyeccion.TotalAporteAdicional = simulacion.TotalAporteAdicional;
            proyeccion.FechaIncremento = simulacion.FechaIncremento;
            proyeccion.FechaVencimiento = simulacion.FechaInicio.AddMonths(dto.Plazo);

            await _context.SaveChangesAsync();

            return proyeccion.IdProyeccion;
        }

        [HttpGet("solicitud/{idSolicitudInversion}")]
        public async Task<IActionResult> ObtenerProyeccionesPorSolicitud(int idSolicitudInversion)
        {
            try
            {
                var proyecciones = await _context.Proyeccion
                    .Where(p => p.IdSolicitudInversion == idSolicitudInversion)
                    .Select(p => new
                    {
                        p.IdProyeccion,
                        p.ProyeccionNombre,
                        p.IdProducto,
                        p.Capital,
                        p.Tasa,
                        p.FechaInicial,
                        p.IdUsuarioCreacion
                    })
                    .ToListAsync();

                if (proyecciones == null || proyecciones.Count == 0)
                    return NotFound(new { success = false, message = "No se encontraron proyecciones para esta solicitud." });

                return Ok(new
                {
                    success = true,
                    proyecciones
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Error al obtener proyecciones por solicitud.",
                    details = ex.Message
                });
            }
        }


        [HttpPost("incremento")]
        public async Task<IActionResult> IncrementarProyeccion([FromBody] ProyeccionIncrementoDto dto)
        {
            try
            {
                var result = await _proyeccionService.IncrementarProyeccionAsync(dto);

                return Ok(new
                {
                    success = true,
                    message = "Incremento realizado correctamente.",
                    idProyeccion = result.IdProyeccionNueva,
                    proyeccion = result.Proyeccion,
                    cronograma = result.Cronograma
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Ocurrió un error al procesar el incremento.",
                    details = ex.Message
                });
            }
        }
    }
}
