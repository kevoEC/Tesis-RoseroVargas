using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.DTOs.SolicitudDTOs;
using System.Data;

namespace Backend_CrmSG.Controllers.Entidad
{
    /// <summary>
    /// Controlador para la gestión de solicitudes de inversión.
    /// Permite operaciones CRUD, consultas avanzadas y procesos de cierre de solicitud.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SolicitudInversionController : ControllerBase
    {
        private readonly IRepository<SolicitudInversion> _repository;
        private readonly IRepository<SolicitudInversionDetalle> _vistaRepository;
        private readonly IConfiguration _configuration;
        private readonly StoredProcedureService _spService;

        /// <summary>
        /// Constructor de SolicitudInversionController.
        /// </summary>
        public SolicitudInversionController(
            IRepository<SolicitudInversion> repository,
            IRepository<SolicitudInversionDetalle> vistaRepository,
            IConfiguration configuration,
            StoredProcedureService spService)
        {
            _repository = repository;
            _vistaRepository = vistaRepository;
            _configuration = configuration;
            _spService = spService;
        }

        /// <summary>
        /// Obtiene todas las solicitudes de inversión (básico, sin detalle).
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _repository.GetAllAsync();
            return Ok(data);
        }

        /// <summary>
        /// Obtiene todas las solicitudes de inversión con detalle completo (unión de varias tablas/vistas).
        /// </summary>
        [HttpGet("detalle")]
        public async Task<IActionResult> GetTodasConDetalle()
        {
            try
            {
                var vistas = await _vistaRepository.GetAllAsync();
                var dtos = vistas.Select(SolicitudMapper.MapearDesdeVista).ToList();
                return Ok(new { success = true, data = dtos });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrió un error al obtener todas las solicitudes detalladas.",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Obtiene una solicitud de inversión por su identificador.
        /// </summary>
        /// <param name="id">Id de la solicitud.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? NotFound() : Ok(item);
        }

        /// <summary>
        /// Crea una nueva solicitud de inversión a partir de un DTO estructurado.
        /// </summary>
        /// <param name="dto">DTO con los datos necesarios para la creación.</param>
        [HttpPost("estructura")]
        public async Task<IActionResult> CreateDesdeDTO([FromBody] SolicitudInversionCreateDTO dto)
        {
            try
            {
                var solicitud = SolicitudMapper.MapearParaCrear(dto);

                await _repository.AddAsync(solicitud);

                return Ok(new
                {
                    success = true,
                    message = "Solicitud creada correctamente."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Error al crear la solicitud." + ex.Message
                });
            }
        }

        /// <summary>
        /// Actualiza una solicitud de inversión existente a partir de un DTO estructurado.
        /// </summary>
        /// <param name="id">Id de la solicitud a actualizar.</param>
        /// <param name="dto">DTO con los campos a actualizar.</param>
        [HttpPut("estructura/{id}")]
        public async Task<IActionResult> UpdateDesdeDTO(int id, [FromBody] SolicitudInversionUpdateDTO dto)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            // Solo mapea los campos permitidos a actualizar
            var updatedEntity = SolicitudMapper.MapearParaActualizar(id, dto);
            updatedEntity.FaseProceso = existing.FaseProceso; // Mantiene el valor actual

            await _repository.UpdateAsync(updatedEntity);
            return Ok(new { success = true, message = "Solicitud actualizada correctamente." });
        }

        /// <summary>
        /// Elimina una solicitud de inversión por su identificador.
        /// </summary>
        /// <param name="id">Id de la solicitud a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Filtra solicitudes de inversión por prospecto o cliente.
        /// Ejemplo: /api/solicitudinversion/filtrar?por=prospecto&id=3
        /// </summary>
        /// <param name="por">Propiedad por la que filtrar (prospecto o cliente).</param>
        /// <param name="id">Id correspondiente.</param>
        [HttpGet("por-prospecto/{idProspecto}")]
        [HttpGet("filtrar")]
        public async Task<IActionResult> FiltrarPorId([FromQuery] string por, [FromQuery] int id)
        {
            // Validar parámetro 'por'
            string? propertyName = por.ToLower() switch
            {
                "prospecto" => "IdProspecto",
                "cliente" => "IdCliente",
                _ => null
            };

            if (propertyName == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Parámetro 'por' inválido. Debe ser 'prospecto' o 'cliente'."
                });
            }

            var resultados = await _repository.GetByPropertyAsync(propertyName, id);
            return Ok(resultados);
        }

        /// <summary>
        /// Obtiene el detalle completo de una solicitud por su identificador.
        /// </summary>
        /// <param name="id">Id de la solicitud.</param>
        [HttpGet("detalle/{id}")]
        public async Task<IActionResult> GetDetalleById(int id)
        {
            try
            {
                var vistas = await _vistaRepository.GetByPropertyAsync("IdSolicitudInversion", id);
                var vista = vistas.FirstOrDefault();
                if (vista == null)
                    return NotFound(new { success = false, message = "Solicitud no encontrada" });

                var dto = SolicitudMapper.MapearDesdeVista(vista);
                return Ok(new { success = true, data = dto });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrió un error al obtener la solicitud.",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Ejecuta el proceso de finalización de una solicitud de inversión, generando tareas y contrato asociado.
        /// </summary>
        /// <param name="dto">DTO con el Id de la solicitud a finalizar.</param>
        [HttpPost("finalizar")]
        public async Task<IActionResult> FinalizarSolicitud([FromBody] FinalizarSolicitudDto dto)
        {
            try
            {
                var (tareasGeneradas, contratoGenerado, cantidadBeneficiarios) =
                    await _spService.EjecutarCrearTareasYContrato(dto.IdSolicitudInversion);

                return Ok(new
                {
                    success = tareasGeneradas,
                    message = "Tareas generadas correctamente.",
                    contratoGenerado,
                    beneficiariosProcesados = cantidadBeneficiarios
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error al generar tareas o contrato.",
                    error = ex.Message
                });
            }
        }
    }
}
