using Microsoft.AspNetCore.Mvc;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Repositories;
using Microsoft.AspNetCore.Authorization;
using Backend_CrmSG.DTOs.CalendarioOperaciones;

namespace Backend_CrmSG.Controllers.Entidades
{
    /// <summary>
    /// Controlador para la gestión del calendario de operaciones financieras.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CalendarioOperacionesController : ControllerBase
    {
        private readonly IRepository<CalendarioOperaciones> _repo;

        /// <summary>
        /// Constructor del controlador de calendario de operaciones.
        /// </summary>
        /// <param name="repo">Repositorio de calendario de operaciones.</param>
        public CalendarioOperacionesController(IRepository<CalendarioOperaciones> repo)
        {
            _repo = repo;
        }

        /// <summary>
        /// Obtiene la lista de todos los calendarios de operaciones.
        /// </summary>
        /// <returns>Lista de calendarios de operaciones.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CalendarioOperaciones>>> Get()
        {
            var lista = await _repo.GetAllAsync();
            return Ok(lista);
        }

        /// <summary>
        /// Obtiene un calendario de operaciones por su identificador.
        /// </summary>
        /// <param name="id">Identificador del calendario.</param>
        /// <returns>Calendario de operaciones encontrado o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CalendarioOperaciones>> Get(int id)
        {
            var item = await _repo.GetByIdAsync(id);
            if (item == null)
                return NotFound();
            return Ok(item);
        }

        /// <summary>
        /// Crea un nuevo calendario de operaciones.
        /// </summary>
        /// <param name="item">Datos del calendario de operaciones a crear.</param>
        /// <returns>Calendario de operaciones creado.</returns>
        [HttpPost]
        public async Task<ActionResult<CalendarioOperaciones>> Post([FromBody] CalendarioOperaciones item)
        {
            // Asigna datos por defecto para la creación (puedes ajustar según tu lógica)
            item.FechaCreacion = DateTime.Now;
            item.IdUsuarioCreacion = 3;
            item.IdUsuarioPropietario = 3;
            await _repo.AddAsync(item);
            return CreatedAtAction(nameof(Get), new { id = item.IdCalendario }, item);
        }

        /// <summary>
        /// Actualiza los datos de un calendario de operaciones existente.
        /// </summary>
        /// <param name="id">Identificador del calendario.</param>
        /// <param name="dto">Datos actualizados del calendario.</param>
        /// <returns>NoContent si la actualización fue exitosa, NotFound si no existe el calendario.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] CalendarioOperacionesUpdateDTO dto)
        {
            var original = await _repo.GetByIdAsync(id);
            if (original == null)
                return NotFound();

            // Actualiza solo los campos permitidos
            original.Nombre = dto.Nombre;
            original.FechaCorte = dto.FechaCorte;
            original.CalendarioInversiones = dto.CalendarioInversiones;
            original.FechaGenerarPagos = dto.FechaGenerarPagos;
            original.FechaEnvioEECC = dto.FechaEnvioEECC;
            original.EstadoProcesoPagos = dto.EstadoProcesoPagos;
            original.EstadoProcesoEnvioEECC = dto.EstadoProcesoEnvioEECC;
            original.EstadoCalendario = dto.EstadoCalendario;
            original.FechaModificacion = DateTime.Now;
            original.IdUsuarioModificacion = dto.IdUsuarioModificacion;

            await _repo.UpdateAsync(original);
            return NoContent();
        }

        /// <summary>
        /// Elimina un calendario de operaciones por su identificador.
        /// </summary>
        /// <param name="id">Identificador del calendario.</param>
        /// <returns>NoContent si la eliminación fue exitosa.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
