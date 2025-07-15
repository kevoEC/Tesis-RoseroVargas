using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Repositories;
using Backend_CrmSG.Models.Vistas;

/// <summary>
/// Controlador para consultas dinámicas sobre vistas (modelos de solo lectura) en el sistema.
/// Permite obtener datos filtrados o completos de diferentes entidades de tipo vista.
/// </summary>
namespace Backend_CrmSG.Controllers.Vistas
{
    [Route("api/vista")]
    [ApiController]
    public class VistaEntidadController : ControllerBase
    {
        private readonly IServiceProvider _serviceProvider;

        /// <summary>
        /// Constructor para la inyección dinámica de repositorios de vistas.
        /// </summary>
        public VistaEntidadController(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        /// <summary>
        /// Obtiene un listado filtrado de una vista dinámica según propiedad y valor.
        /// </summary>
        /// <param name="entidad">Nombre de la vista (ej: actividad, prospecto, solicitudinversion, etc).</param>
        /// <param name="por">Nombre de la propiedad por la que filtrar (ej: IdProspecto, IdCliente).</param>
        /// <param name="id">Valor a buscar en la propiedad.</param>
        /// <returns>Listado filtrado de la entidad solicitada.</returns>
        /// <response code="200">Retorna el listado filtrado correctamente.</response>
        /// <response code="400">Si la entidad no está registrada o parámetros incorrectos.</response>
        /// <response code="500">Si hay error al resolver el repositorio.</response>
        [HttpGet("{entidad}/filtrar")]
        public async Task<IActionResult> FiltrarVista([FromRoute] string entidad, [FromQuery] string por, [FromQuery] int id)
        {
            // Mapeo de nombres de vistas a sus modelos de detalle
            var mapa = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
            {
                { "actividad", typeof(Models.Vistas.ActividadDetalle) },
                { "prospecto", typeof(Models.Vistas.ProspectoDetalle) },
                { "solicitudinversion", typeof(Models.Vistas.SolicitudInversionDetalle) },
                { "referencia" , typeof(ReferenciaDetalle) },
                { "beneficiario", typeof(BeneficiarioDetalle) },
                { "asesorcomercial", typeof(AsesorComercialDetalle) },
                { "proyeccion", typeof(ProyeccionDetalle) },
                { "documento", typeof(DocumentoBasicoDetalle)}
            };

            if (!mapa.TryGetValue(entidad, out var tipoEntidad))
            {
                return BadRequest(new { success = false, message = $"Vista '{entidad}' no está registrada en el controlador." });
            }

            // Obtener el repositorio dinámicamente
            var repoType = typeof(IRepository<>).MakeGenericType(tipoEntidad);
            dynamic? repo = _serviceProvider.GetService(repoType);

            if (repo == null)
                return StatusCode(500, new { success = false, message = $"No se pudo resolver el repositorio para {tipoEntidad.Name}." });

            // Ejecutar GetByPropertyAsync dinámicamente
            var method = repoType.GetMethod("GetByPropertyAsync");
            if (method == null)
                return StatusCode(500, new { success = false, message = "Método GetByPropertyAsync no disponible." });

            var task = (Task)method.Invoke(repo, new object[] { por, id })!;
            await task.ConfigureAwait(false);

            var resultProperty = task.GetType().GetProperty("Result");
            var result = resultProperty?.GetValue(task);

            return Ok(result);
        }

        /// <summary>
        /// Obtiene todos los registros de la vista especificada.
        /// </summary>
        /// <param name="entidad">Nombre de la vista/entidad (ej: actividad, prospecto, solicitud, etc).</param>
        /// <returns>Listado completo de la vista especificada.</returns>
        /// <response code="200">Retorna la lista completa.</response>
        /// <response code="400">Si la entidad no está registrada.</response>
        /// <response code="500">Si no se puede resolver el repositorio.</response>
        [HttpGet("{entidad}")]
        public async Task<IActionResult> GetTodos(string entidad)
        {
            var mapa = new Dictionary<string, Type>(StringComparer.OrdinalIgnoreCase)
            {
                { "actividad", typeof(ActividadDetalle) },
                { "prospecto", typeof(ProspectoDetalle) },
                { "solicitud", typeof(SolicitudInversionDetalle) },
                { "referencia" , typeof(ReferenciaDetalle) },
                { "beneficiario", typeof(BeneficiarioDetalle) },
                { "asesorcomercial", typeof(AsesorComercialDetalle) },
                { "proyeccion", typeof(ProyeccionDetalle) },
                { "documento", typeof(DocumentoBasicoDetalle)}
            };

            if (!mapa.TryGetValue(entidad, out var tipoEntidad))
            {
                return BadRequest(new
                {
                    success = false,
                    message = $"Entidad '{entidad}' no está registrada. Las disponibles son: {string.Join(", ", mapa.Keys)}"
                });
            }

            var repoType = typeof(IRepository<>).MakeGenericType(tipoEntidad);
            dynamic? repo = _serviceProvider.GetService(repoType);

            if (repo == null)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"No se pudo resolver el repositorio para '{tipoEntidad.Name}'",
                    tipo = tipoEntidad.FullName
                });
            }

            IEnumerable<object> resultados = await repo.GetAllAsync();
            return Ok(resultados);
        }

        /// <summary>
        /// Filtra la vista SolicitudInversionDetalle por propiedad específica y retorna una lista de DTOs.
        /// </summary>
        /// <param name="por">Propiedad por la que filtrar (prospecto, cliente, solicitud).</param>
        /// <param name="id">Valor a buscar en la propiedad.</param>
        /// <returns>Listado mapeado de la vista SolicitudInversionDetalle.</returns>
        /// <response code="200">Retorna la lista filtrada de DTOs.</response>
        /// <response code="400">Si el parámetro 'por' es inválido.</response>
        /// <response code="500">Si ocurre un error interno.</response>
        [HttpGet("solicitudinversion/filtrarDTO")]
        public async Task<IActionResult> FiltrarVistaSolicitudInversionDTO([FromQuery] string por, [FromQuery] int id)
        {
            if (string.IsNullOrWhiteSpace(por))
            {
                return BadRequest(new { success = false, message = "Debe especificar el parámetro 'por'." });
            }

            var property = por.ToLower() switch
            {
                "prospecto" => "IdProspecto",
                "cliente" => "IdCliente",
                "solicitud" => "IdSolicitudInversion",
                _ => null
            };

            if (property == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Parámetro 'por' inválido. Use 'prospecto' o 'cliente'."
                });
            }

            var repo = _serviceProvider.GetService<IRepository<SolicitudInversionDetalle>>();
            if (repo == null)
            {
                return StatusCode(500, new { success = false, message = "No se pudo resolver el repositorio para la vista." });
            }

            var resultados = await repo.GetByPropertyAsync(property, id);

            var mapeados = resultados.Select(SolicitudMapper.MapearDesdeVista).ToList();

            return Ok(new { success = true, data = mapeados });
        }
    }
}
