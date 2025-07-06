using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Entidades;
using Backend_CrmSG.Services.Entidad.Adendum;
using Microsoft.EntityFrameworkCore;

public class AdendumService : IAdendumService
{
    private readonly AppDbContext _context;

    public AdendumService(AppDbContext context)
    {
        _context = context;
    }

    // 1. Crear Adendum (secuencial y validaciones)
    public async Task<AdendumDetalleDto> CrearAdendumAsync(AdendumCreateDto dto)
    {
        // 1.1. Validar que la inversión exista
        var inversion = await _context.Inversion.FindAsync(dto.IdInversion);
        if (inversion == null)
            throw new Exception("Inversión no encontrada.");

        // 1.2. Validar que no exista Adendum para ese periodo en la inversión
        bool existe = await _context.Adendum
            .AnyAsync(a => a.IdInversion == dto.IdInversion && a.PeriodoIncremento == dto.PeriodoIncremento);
        if (existe)
            throw new Exception("Ya existe un adendum en ese periodo para la inversión.");

        // 1.3. Calcular secuencial AD-XX solo para la inversión
        int totalAdendums = await _context.Adendum.CountAsync(a => a.IdInversion == dto.IdInversion);
        string nombreBase = inversion.InversionNombre.Trim();
        string secuencial = (totalAdendums + 1).ToString("D2");
        string nombreAdendum = $"{nombreBase} - AD-{secuencial}";

        // 1.4. El cronograma original debe ser igual a la proyección original
        int idCronogramaOriginal = dto.IdProyeccionOriginal ?? throw new Exception("La proyección original es obligatoria.");

        // 1.5. Crear el Adendum
        var adendum = new Adendum
        {
            IdInversion = dto.IdInversion,
            IdProyeccionOriginal = dto.IdProyeccionOriginal,
            PeriodoIncremento = dto.PeriodoIncremento,
            MontoIncremento = dto.MontoIncremento,
            Estado = 1, // 1: Proyectado
            NombreAdendum = nombreAdendum,
            IdUsuarioCreacion = dto.IdUsuarioCreacion,
            FechaCreacion = DateTime.Now,
            IdCronogramaProyeccionOriginal = idCronogramaOriginal,
            GenerarDocumentos = false,
            ContinuarFlujo = false,
            IdUsuarioPropietario = dto.IdUsuarioCreacion
            // Los campos de incremento se llenan en el siguiente paso del flujo
        };
        _context.Adendum.Add(adendum);
        await _context.SaveChangesAsync();
        // Recarga el objeto para obtener los valores por default de la DB (ej: fecha exacta)
        await _context.Entry(adendum).ReloadAsync();

        // 1.6. Mapear a DTO y retornar
        return MapToDto(adendum);
    }

    // 2. Actualizar Adendum (ejemplo: cambiar estado, guardar proyeccion, etc)
    public async Task<AdendumDetalleDto> ActualizarAdendumAsync(AdendumUpdateDto dto)
    {
        var adendum = await _context.Adendum.FindAsync(dto.IdAdendum);
        if (adendum == null)
            throw new Exception("Adendum no encontrado.");

        adendum.Estado = dto.Estado ?? adendum.Estado;
        adendum.IdUsuarioModificacion = dto.IdUsuarioModificacion;
        adendum.FechaModificacion = DateTime.Now;

        // Si necesitas actualizar más campos, hazlo aquí
        _context.Adendum.Update(adendum);
        await _context.SaveChangesAsync();
        await _context.Entry(adendum).ReloadAsync();

        return MapToDto(adendum);
    }

    // 3. Obtener Adendum por Id
    public async Task<AdendumDetalleDto> ObtenerAdendumPorIdAsync(int idAdendum)
    {
        var adendum = await _context.Adendum.FindAsync(idAdendum);
        if (adendum == null)
            throw new Exception("Adendum no encontrado.");

        return MapToDto(adendum);
    }

    // 4. Obtener lista de adendums por inversión
    public async Task<List<AdendumDetalleDto>> ObtenerAdendumsPorInversionAsync(int idInversion)
    {
        return await _context.Adendum
            .Where(a => a.IdInversion == idInversion)
            .OrderBy(a => a.FechaCreacion)
            .Select(a => new AdendumDetalleDto
            {
                IdAdendum = a.IdAdendum,
                NombreAdendum = a.NombreAdendum,
                IdInversion = a.IdInversion,
                IdProyeccionOriginal = a.IdProyeccionOriginal,
                IdProyeccionIncremento = a.IdProyeccionIncremento,
                IdCronogramaProyeccionOriginal = a.IdCronogramaProyeccionOriginal,
                IdCronogramaProyeccionIncremento = a.IdCronogramaProyeccionIncremento,
                PeriodoIncremento = a.PeriodoIncremento,
                MontoIncremento = a.MontoIncremento,
                Estado = a.Estado,
                GenerarDocumentos = a.GenerarDocumentos,
                ContinuarFlujo = a.ContinuarFlujo,
                IdUsuarioCreacion = a.IdUsuarioCreacion,
                FechaCreacion = a.FechaCreacion,
                IdUsuarioModificacion = a.IdUsuarioModificacion,
                FechaModificacion = a.FechaModificacion,
                IdUsuarioPropietario = a.IdUsuarioPropietario
            })
            .ToListAsync();
    }

    // 5. Generar documentos (llama SP y setea flag y estado)
    public async Task<bool> GenerarDocumentosAsync(int idAdendum, int idUsuario)
    {
        var adendum = await _context.Adendum.FindAsync(idAdendum);
        if (adendum == null)
            throw new Exception("Adendum no encontrado.");

        // Llama SP con IdMotivo = 37 (Adendum)
        var result = await _context.Database.ExecuteSqlRawAsync(
            "EXEC sp_CrearDocumentosPorMotivo @p0, @p1, @p2, @p3, @p4, @p5",
            parameters: new object[]
            {
            37, // IdMotivo Adendum
            null, // IdTarea
            null, // IdSolicitudInversion
            adendum.IdInversion,
            null, // IdCaso
            adendum.IdAdendum // IdAdendum NUEVO CAMPO EN SP y en tabla Documento
            }
        );

        if (result > 0)
        {
            adendum.GenerarDocumentos = true;
            adendum.Estado = 2; // Cambia el estado aquí 👈
            adendum.IdUsuarioModificacion = idUsuario;
            adendum.FechaModificacion = DateTime.Now;
            _context.Adendum.Update(adendum);
            await _context.SaveChangesAsync();
            return true;
        }

        return false;
    }

    // 6. Continuar flujo (setea cronograma y completa el adendum)
    public async Task<bool> ContinuarFlujoAsync(int idAdendum, int idUsuario)
    {
        var adendum = await _context.Adendum.FindAsync(idAdendum);
        if (adendum == null)
            throw new Exception("Adendum no encontrado.");

        // Cambia estado a Completado (3), setea el cronograma de la inversión al de la nueva proyección de incremento
        adendum.ContinuarFlujo = true;
        adendum.Estado = 3; // Completado
        adendum.IdUsuarioModificacion = idUsuario;
        adendum.FechaModificacion = DateTime.Now;
        _context.Adendum.Update(adendum);

        // Desactivar cronograma anterior y activar el nuevo
        var cronogramaAnterior = await _context.CronogramaProyeccion
            .Where(c => c.IdProyeccion == adendum.IdProyeccionOriginal && c.EsActivo)
            .FirstOrDefaultAsync();
        if (cronogramaAnterior != null)
        {
            cronogramaAnterior.EsActivo = false;
            _context.CronogramaProyeccion.Update(cronogramaAnterior);
        }

        var cronogramaNuevo = await _context.CronogramaProyeccion
            .Where(c => c.IdProyeccion == adendum.IdProyeccionIncremento)
            .FirstOrDefaultAsync();
        if (cronogramaNuevo != null)
        {
            cronogramaNuevo.EsActivo = true;
            _context.CronogramaProyeccion.Update(cronogramaNuevo);
        }

        // Actualizar Inversion con la nueva proyección
        var inversion = await _context.Inversion.FindAsync(adendum.IdInversion);
        if (inversion != null && adendum.IdProyeccionIncremento.HasValue)
        {
            inversion.IdProyeccion = adendum.IdProyeccionIncremento.Value;
            _context.Inversion.Update(inversion);
        }

        await _context.SaveChangesAsync();
        return true;
    }

    // 7. Map to DTO (centralizado)
    private AdendumDetalleDto MapToDto(Adendum a)
    {
        return new AdendumDetalleDto
        {
            IdAdendum = a.IdAdendum,
            NombreAdendum = a.NombreAdendum,
            IdInversion = a.IdInversion,
            IdProyeccionOriginal = a.IdProyeccionOriginal,
            IdProyeccionIncremento = a.IdProyeccionIncremento,
            IdCronogramaProyeccionOriginal = a.IdCronogramaProyeccionOriginal,
            IdCronogramaProyeccionIncremento = a.IdCronogramaProyeccionIncremento,
            PeriodoIncremento = a.PeriodoIncremento,
            MontoIncremento = a.MontoIncremento,
            Estado = a.Estado,
            GenerarDocumentos = a.GenerarDocumentos,
            ContinuarFlujo = a.ContinuarFlujo,
            IdUsuarioCreacion = a.IdUsuarioCreacion,
            FechaCreacion = a.FechaCreacion,
            IdUsuarioModificacion = a.IdUsuarioModificacion,
            FechaModificacion = a.FechaModificacion,
            IdUsuarioPropietario = a.IdUsuarioPropietario
        };
    }

    public async Task<AdendumFullDetalleDto> ObtenerDetalleCompletoAsync(int idAdendum)
    {
        var adendum = await _context.Adendum.FindAsync(idAdendum);
        if (adendum == null)
            throw new Exception("Adendum no encontrado.");

        // Proyección y cronograma original
        var proyOriginal = await _context.Proyeccion.FindAsync(adendum.IdProyeccionOriginal);
        var cronogramaOrigEnt = await _context.CronogramaProyeccion
            .Where(c => c.IdProyeccion == adendum.IdProyeccionOriginal && c.EsActivo)
            .FirstOrDefaultAsync();

        List<CronogramaCuotaDto> cronogramaOriginal = null;
        if (cronogramaOrigEnt != null && !string.IsNullOrEmpty(cronogramaOrigEnt.PeriodosJson))
            cronogramaOriginal = System.Text.Json.JsonSerializer.Deserialize<List<CronogramaCuotaDto>>(cronogramaOrigEnt.PeriodosJson);

        // Proyección y cronograma incremento (si existe)
        Proyeccion proyIncremento = null;
        List<CronogramaCuotaDto> cronogramaIncremento = null;
        if (adendum.IdProyeccionIncremento.HasValue)
        {
            proyIncremento = await _context.Proyeccion.FindAsync(adendum.IdProyeccionIncremento.Value);
            var cronogramaIncEnt = await _context.CronogramaProyeccion
                .Where(c => c.IdProyeccion == adendum.IdProyeccionIncremento && c.EsActivo)
                .FirstOrDefaultAsync();
            if (cronogramaIncEnt != null && !string.IsNullOrEmpty(cronogramaIncEnt.PeriodosJson))
                cronogramaIncremento = System.Text.Json.JsonSerializer.Deserialize<List<CronogramaCuotaDto>>(cronogramaIncEnt.PeriodosJson);
        }

        // Mapea el DTO final
        return new AdendumFullDetalleDto
        {
            Adendum = new AdendumDetalleDto
            {
                IdAdendum = adendum.IdAdendum,
                NombreAdendum = adendum.NombreAdendum,
                IdInversion = adendum.IdInversion,
                IdProyeccionOriginal = adendum.IdProyeccionOriginal,
                IdProyeccionIncremento = adendum.IdProyeccionIncremento,
                IdCronogramaProyeccionOriginal = adendum.IdCronogramaProyeccionOriginal,
                IdCronogramaProyeccionIncremento = adendum.IdCronogramaProyeccionIncremento,
                PeriodoIncremento = adendum.PeriodoIncremento,
                MontoIncremento = adendum.MontoIncremento,
                Estado = adendum.Estado,
                GenerarDocumentos = adendum.GenerarDocumentos,
                ContinuarFlujo = adendum.ContinuarFlujo,
                IdUsuarioCreacion = adendum.IdUsuarioCreacion,
                FechaCreacion = adendum.FechaCreacion,
                IdUsuarioModificacion = adendum.IdUsuarioModificacion,
                FechaModificacion = adendum.FechaModificacion,
                IdUsuarioPropietario = adendum.IdUsuarioPropietario
            },
            ProyeccionOriginal = proyOriginal,
            CronogramaOriginal = cronogramaOriginal,
            ProyeccionIncremento = proyIncremento,
            CronogramaIncremento = cronogramaIncremento
        };
    }

    public async Task<AdendumDetalleDto> SetIncrementoAsync(AdendumSetIncrementoDto dto)
    {
        var adendum = await _context.Adendum.FindAsync(dto.IdAdendum);
        if (adendum == null)
            throw new Exception("Adendum no encontrado.");

        adendum.IdProyeccionIncremento = dto.IdProyeccionIncremento;
        adendum.IdCronogramaProyeccionIncremento = dto.IdCronogramaProyeccionIncremento;
        adendum.IdUsuarioModificacion = dto.IdUsuarioModificacion;
        adendum.FechaModificacion = DateTime.Now;

        _context.Adendum.Update(adendum);
        await _context.SaveChangesAsync();

        return new AdendumDetalleDto
        {
            IdAdendum = adendum.IdAdendum,
            NombreAdendum = adendum.NombreAdendum,
            IdInversion = adendum.IdInversion,
            IdProyeccionOriginal = adendum.IdProyeccionOriginal,
            IdProyeccionIncremento = adendum.IdProyeccionIncremento,
            IdCronogramaProyeccionOriginal = adendum.IdCronogramaProyeccionOriginal,
            IdCronogramaProyeccionIncremento = adendum.IdCronogramaProyeccionIncremento,
            PeriodoIncremento = adendum.PeriodoIncremento,
            MontoIncremento = adendum.MontoIncremento,
            Estado = adendum.Estado,
            GenerarDocumentos = adendum.GenerarDocumentos,
            ContinuarFlujo = adendum.ContinuarFlujo,
            IdUsuarioCreacion = adendum.IdUsuarioCreacion,
            FechaCreacion = adendum.FechaCreacion,
            IdUsuarioModificacion = adendum.IdUsuarioModificacion,
            FechaModificacion = adendum.FechaModificacion,
            IdUsuarioPropietario = adendum.IdUsuarioPropietario
        };
    }


}
