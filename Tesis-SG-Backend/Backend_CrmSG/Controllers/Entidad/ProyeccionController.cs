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
    /// <summary>
    /// Controlador para la gestión de proyecciones de inversión y sus cronogramas.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProyeccionController : ControllerBase
    {
        private readonly ProyeccionService _proyeccionService;
        private readonly AppDbContext _context;
        private readonly SimuladorProyeccionService _simulador;

        /// <summary>
        /// Constructor del controlador de proyecciones.
        /// </summary>
        /// <param name="proyeccionService">Servicio de lógica de proyecciones.</param>
        /// <param name="context">Contexto de base de datos.</param>
        /// <param name="simulador">Servicio de simulación de proyecciones.</param>
        public ProyeccionController(ProyeccionService proyeccionService, AppDbContext context, SimuladorProyeccionService simulador)
        {
            _proyeccionService = proyeccionService;
            _context = context;
            _simulador = simulador;
        }

        /// <summary>
        /// Crea una nueva proyección de inversión.
        /// </summary>
        /// <param name="dto">Datos para crear la proyección.</param>
        /// <returns>Proyección creada, cronograma y mensaje de éxito.</returns>
        [HttpPost]
        public async Task<IActionResult> CrearProyeccion([FromBody] ProyeccionCreateDto dto)
        {
            try
            {
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

        /// <summary>
        /// Obtiene el cronograma de pagos/cuotas de una proyección.
        /// </summary>
        /// <param name="id">Identificador de la proyección.</param>
        /// <returns>Cronograma de la proyección o NotFound si no existe.</returns>
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
                        .OrderByDescending(c => c.IdCronogramaProyeccion)
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

        /// <summary>
        /// Actualiza los datos y el cronograma de una proyección existente.
        /// </summary>
        /// <param name="dto">Datos actualizados de la proyección.</param>
        /// <returns>Identificador de la proyección actualizada.</returns>
        [HttpPut("{id}")]
        public async Task<int> ActualizarProyeccionAsync(ProyeccionUpdateDto dto)
        {
            // Lógica completa documentada en el método (ver código fuente)
            // Puedes detallar aquí si gustas.
            var proyeccion = await _context.Proyeccion
                .FirstOrDefaultAsync(p => p.IdProyeccion == dto.IdProyeccionAnterior);

            if (proyeccion == null)
                throw new Exception("La proyección anterior no fue encontrada.");

            var cronogramaAnterior = await _context.CronogramaProyeccion
                .FirstOrDefaultAsync(c => c.IdProyeccion == dto.IdProyeccionAnterior && c.EsActivo);

            if (cronogramaAnterior == null)
                throw new Exception("No se encontró cronograma activo asociado a la proyección anterior.");

            cronogramaAnterior.EsActivo = false;
            _context.CronogramaProyeccion.Update(cronogramaAnterior);

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

            var nuevoCronograma = new CronogramaProyeccion
            {
                IdProyeccion = proyeccion.IdProyeccion,
                PeriodosJson = JsonSerializer.Serialize(simulacion.Cronograma),
                FechaCreacion = DateTime.Now,
                EsActivo = true,
                Version = cronogramaAnterior.Version + 1
            };

            _context.CronogramaProyeccion.Add(nuevoCronograma);

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

        /// <summary>
        /// Obtiene la lista de proyecciones asociadas a una solicitud de inversión.
        /// </summary>
        /// <param name="idSolicitudInversion">Identificador de la solicitud de inversión.</param>
        /// <returns>Lista de proyecciones para la solicitud dada.</returns>
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

        /// <summary>
        /// Realiza un incremento de capital sobre una proyección existente.
        /// </summary>
        /// <param name="dto">Datos para el incremento de proyección.</param>
        /// <returns>Resultado del incremento, incluyendo la nueva proyección y cronograma.</returns>
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
