using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.DTOs.Backend_CrmSG.DTOs;
using Backend_CrmSG.Models.Entidades;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Backend_CrmSG.Services
{
    public class ProyeccionService
    {
        private readonly AppDbContext _context;
        private readonly SimuladorProyeccionService _simulador;

        public ProyeccionService(AppDbContext context, SimuladorProyeccionService simulador)
        {
            _context = context;
            _simulador = simulador;
        }

        public async Task<int> CrearProyeccionAsync(ProyeccionCreateDto dto, int idUsuario)
        {
            // 1. Obtener producto
            var producto = await _context.Producto.FindAsync(dto.IdProducto);
            if (producto == null)
                throw new Exception("Producto no encontrado");

            // 2. Obtener configuración válida
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

            // 3. Crear la entidad base de Proyección
            var proyeccion = new Proyeccion
            {
                IdProducto = dto.IdProducto,
                Capital = dto.Capital,
                AporteAdicional = dto.AporteAdicional ?? 0,
                Plazo = dto.Plazo,
                FechaInicial = dto.FechaInicial,
                Tasa = configuracion.Taza,
                CosteOperativo = dto.CosteOperativo,
                CosteNotarizacion = dto.CosteNotarizacion ?? 0,
                IdConfiguracionesProducto = configuracion.IdConfiguraciones,
                IdOrigenCapital = dto.IdOrigenCapital,
                IdOrigenIncremento = dto.IdOrigenIncremento,
                IdSolicitudInversion = dto.IdSolicitudInversion,
                IdUsuarioCreacion = idUsuario,
                FechaCreacion = DateTime.Now,
                ProyeccionNombre = $"{producto.ProductoNombre} - ${dto.Capital} ({dto.Plazo} meses)"
            };

            _context.Proyeccion.Add(proyeccion);
            await _context.SaveChangesAsync(); // Se necesita el IdProyeccion generado

            // 4. Calcular cronograma
            var simulacion = _simulador.ObtenerSimulacion(new SimulacionRequest
            {
                Capital = dto.Capital,
                Plazo = dto.Plazo,
                FechaInicial = dto.FechaInicial,
                Tasa = configuracion.Taza,
                AporteAdicional = dto.AporteAdicional ?? 0,
                CosteOperativo = dto.CosteOperativo ?? 0,
                CosteNotarizacion = dto.CosteNotarizacion ?? 0,
                IdOrigenCapital = dto.IdOrigenCapital,               // 👈 Añadido aquí
                Periodicidad = producto.Periocidad, // 👈 Si es null, se usa 0
            });

            // 5. Guardar cronograma JSON en SP
            var json = JsonSerializer.Serialize(simulacion.Cronograma);
            await _context.Database.ExecuteSqlRawAsync(
                "EXEC sp_GuardarCronogramaProyeccion @p0, @p1",
                parameters: new object[] { proyeccion.IdProyeccion, json }
            );

            // 6. Actualizar totales en la proyección
            proyeccion.TotalRentabilidad = simulacion.TotalRentabilidad;
            proyeccion.TotalCosteOperativo = simulacion.TotalCosteOperativo;
            proyeccion.TotalRentaPeriodo = simulacion.TotalRentaPeriodo;
            proyeccion.RendimientosMasCapital = simulacion.RendimientoCapital;
            proyeccion.ValorProyectadoLiquidar = simulacion.ValorProyectadoLiquidar;
            proyeccion.TotalAporteAdicional = simulacion.TotalAporteAdicional;
            proyeccion.FechaIncremento = simulacion.FechaIncremento;
            proyeccion.FechaVencimiento = simulacion.FechaInicio.AddMonths(dto.Plazo);

            _context.Proyeccion.Update(proyeccion);
            await _context.SaveChangesAsync();

            return proyeccion.IdProyeccion;
        }

        public async Task<int> ActualizarProyeccionAsync(ProyeccionUpdateDto dto)
        {
            // 1. Buscar la proyección anterior (solo para saber ID)
            var proyeccionAnterior = await _context.Proyeccion
                .FirstOrDefaultAsync(p => p.IdProyeccion == dto.IdProyeccionAnterior);

            if (proyeccionAnterior == null)
                throw new Exception("La proyección anterior no fue encontrada.");

            // 2. Buscar el cronograma anterior y desactivarlo
            var cronogramaAnterior = await _context.CronogramaProyeccion
                .FirstOrDefaultAsync(c => c.IdProyeccion == dto.IdProyeccionAnterior && c.EsActivo);

            if (cronogramaAnterior == null)
                throw new Exception("No se encontró cronograma activo asociado a la proyección anterior.");

            cronogramaAnterior.EsActivo = false;
            _context.CronogramaProyeccion.Update(cronogramaAnterior);

            // 3. Buscar el producto
            var producto = await _context.Producto.FindAsync(dto.IdProducto);
            if (producto == null)
                throw new Exception("Producto no encontrado.");

            // 4. Buscar la configuración válida
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

            // 5. Crear nueva proyección
            var nuevaProyeccion = new Proyeccion
            {
                IdProducto = dto.IdProducto,
                Capital = dto.Capital,
                AporteAdicional = dto.AporteAdicional ?? 0,
                Plazo = dto.Plazo,
                FechaInicial = dto.FechaInicial,
                Tasa = configuracion.Taza,
                CosteOperativo = dto.CosteOperativo,
                CosteNotarizacion = dto.CosteNotarizacion ?? 0,
                IdConfiguracionesProducto = configuracion.IdConfiguraciones,
                IdOrigenCapital = dto.IdOrigenCapital,
                IdOrigenIncremento = dto.IdOrigenIncremento,
                IdSolicitudInversion = dto.IdSolicitudInversion,
                IdUsuarioCreacion = dto.IdUsuario,
                FechaCreacion = DateTime.Now,
                ProyeccionNombre = $"{producto.ProductoNombre} - ${dto.Capital} ({dto.Plazo} meses)"
            };

            _context.Proyeccion.Add(nuevaProyeccion);
            await _context.SaveChangesAsync();

            // 6. Simular nuevo cronograma
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

            // 7. Crear nuevo cronograma
            var nuevoCronograma = new CronogramaProyeccion
            {
                IdProyeccion = nuevaProyeccion.IdProyeccion,
                PeriodosJson = JsonSerializer.Serialize(simulacion.Cronograma),
                FechaCreacion = DateTime.Now,
                EsActivo = true,
                Version = cronogramaAnterior.Version + 1
            };

            _context.CronogramaProyeccion.Add(nuevoCronograma);
            await _context.SaveChangesAsync();

            // 8. Actualizar totales de nueva proyección
            nuevaProyeccion.TotalRentabilidad = simulacion.TotalRentabilidad;
            nuevaProyeccion.TotalCosteOperativo = simulacion.TotalCosteOperativo;
            nuevaProyeccion.TotalRentaPeriodo = simulacion.TotalRentaPeriodo;
            nuevaProyeccion.RendimientosMasCapital = simulacion.RendimientoCapital;
            nuevaProyeccion.ValorProyectadoLiquidar = simulacion.ValorProyectadoLiquidar;
            nuevaProyeccion.TotalAporteAdicional = simulacion.TotalAporteAdicional;
            nuevaProyeccion.FechaIncremento = simulacion.FechaIncremento;
            nuevaProyeccion.FechaVencimiento = simulacion.FechaInicio.AddMonths(dto.Plazo);

            _context.Proyeccion.Update(nuevaProyeccion);
            await _context.SaveChangesAsync();

            return nuevaProyeccion.IdProyeccion;
        }


        public async Task<ProyeccionIncrementoResultDto> IncrementarProyeccionAsync(ProyeccionIncrementoDto dto)
        {
            // 1. Buscar la proyección original
            var proyeccionOriginal = await _context.Proyeccion
                .FirstOrDefaultAsync(p => p.IdProyeccion == dto.IdProyeccionOriginal);
            if (proyeccionOriginal == null)
                throw new Exception("Proyección original no encontrada.");

            // 2. Buscar la inversión asociada a la proyección original
            var inversion = await _context.Inversion
                .FirstOrDefaultAsync(i => i.IdProyeccion == dto.IdProyeccionOriginal);
            if (inversion == null)
                throw new Exception("No se encontró la inversión asociada a la proyección original.");

            // 3. Validar si ya existe un Adendum para este periodo Y YA TIENE GENERADO EL INCREMENTO
            var adendumExistente = await _context.Adendum
                .FirstOrDefaultAsync(a =>
                    a.IdInversion == inversion.IdInversion &&
                    a.PeriodoIncremento == dto.PeriodoIncremento &&
                    a.IncrementoGenerado == true);

            if (adendumExistente != null)
            {
                throw new Exception("Ya existe un incremento (Adendum) para este periodo en la inversión seleccionada.");
            }


            // 4. Traer cronograma original y validarlo
            var cronogramaOriginal = await _context.CronogramaProyeccion
                .Where(c => c.IdProyeccion == dto.IdProyeccionOriginal && c.EsActivo)
                .FirstOrDefaultAsync();
            if (cronogramaOriginal == null)
                throw new Exception("No se encontró cronograma activo para la proyección original.");

            // 5. Deserializar el cronograma
            var cronogramaList = JsonSerializer.Deserialize<List<CronogramaCuotaDto>>(cronogramaOriginal.PeriodosJson);
            if (cronogramaList == null || cronogramaList.Count == 0)
                throw new Exception("El cronograma original está vacío.");

            // 6. Validar periodo seleccionado
            if (dto.PeriodoIncremento < 1 || dto.PeriodoIncremento > proyeccionOriginal.Plazo)
                throw new Exception("Periodo de incremento fuera de rango.");

            // 7. Buscar configuración válida por el nuevo monto (mismo producto, mismo plazo)
            // Capital base: el capital final del periodo anterior al incremento (o el primero si es periodo 1)
            decimal capitalBase = (dto.PeriodoIncremento == 1)
                ? cronogramaList[0].Capital
                : cronogramaList[dto.PeriodoIncremento - 2].CapitalFinal;

            decimal nuevoCapital = capitalBase + dto.MontoIncremento;
            short plazoRestante = (short)(proyeccionOriginal.Plazo - dto.PeriodoIncremento);

            var configuracion = await _context.ConfiguracionesProducto
                .Where(c =>
                    c.IdProducto == proyeccionOriginal.IdProducto &&
                    c.Plazo == proyeccionOriginal.Plazo &&
                    c.IdOrigen == proyeccionOriginal.IdOrigenCapital &&
                    nuevoCapital >= c.MontoMinimo &&
                    nuevoCapital <= c.MontoMaximo)
                .FirstOrDefaultAsync();

            if (configuracion == null)
                throw new Exception("No hay configuración válida para el nuevo monto y plazo.");

            // 8. Construir nuevo cronograma
            var nuevoCronograma = new List<CronogramaCuotaDto>();

            // --- (a) Copiar periodos previos al incremento SIN CAMBIOS
            for (int i = 0; i < dto.PeriodoIncremento - 1; i++)
            {
                nuevoCronograma.Add(cronogramaList[i]);
            }

            // --- (b) Periodo de incremento (modificado solo en capital final y aporte adicional)
            var cuotaIncremento = cronogramaList[dto.PeriodoIncremento - 1];

            var nuevaCuotaIncremento = new CronogramaCuotaDto
            {
                Periodo = cuotaIncremento.Periodo,
                FechaInicial = cuotaIncremento.FechaInicial,
                FechaVencimiento = cuotaIncremento.FechaVencimiento,
                Capital = cuotaIncremento.Capital,
                CapitalOperacion = cuotaIncremento.CapitalOperacion,
                AporteMensual = cuotaIncremento.AporteMensual,
                AporteAdicional = dto.MontoIncremento,
                AporteOperacion = cuotaIncremento.AporteOperacion,
                AporteOperacionAdicional = dto.MontoIncremento,
                MontoOperacion = cuotaIncremento.MontoOperacion + dto.MontoIncremento,
                Tasa = cuotaIncremento.Tasa,
                Rentabilidad = cuotaIncremento.Rentabilidad,  // ¡NO SE MODIFICA!
                RentaPeriodo = cuotaIncremento.RentaPeriodo,
                RentaAcumulada = cuotaIncremento.RentaAcumulada,
                RentaAcumuladaNoPagada = cuotaIncremento.RentaAcumuladaNoPagada,
                RentaPendientePagar = cuotaIncremento.RentaPendientePagar,
                CostoOperativo = cuotaIncremento.CostoOperativo,
                CostoNotarizacion = cuotaIncremento.CostoNotarizacion,
                CapitalRenta = cuotaIncremento.CapitalRenta,
                CapitalFinal = cuotaIncremento.CapitalFinal + dto.MontoIncremento, // aquí sí!
                MontoPagar = cuotaIncremento.MontoPagar,
                PagaRenta = cuotaIncremento.PagaRenta,
                UltimaCuota = false // solo será última si no hay periodos restantes
            };

            nuevoCronograma.Add(nuevaCuotaIncremento);

            // --- (c) Simular los periodos siguientes usando el simulador
            if (plazoRestante > 0)
            {
                // OJO: Fecha inicial del siguiente periodo = FechaVencimiento de cuotaIncremento
                var producto = await _context.Producto.FindAsync(proyeccionOriginal.IdProducto);
                if (producto == null)
                    throw new Exception("Producto no encontrado.");

                var simulacion = _simulador.ObtenerSimulacion(new SimulacionRequest
                {
                    Capital = nuevaCuotaIncremento.CapitalFinal,
                    Plazo = plazoRestante,
                    FechaInicial = nuevaCuotaIncremento.FechaVencimiento,
                    Tasa = configuracion.Taza,
                    AporteAdicional = 0, // el incremento fue en el periodo anterior
                    CosteOperativo = proyeccionOriginal.CosteOperativo ?? 0,
                    CosteNotarizacion = proyeccionOriginal.CosteNotarizacion ?? 0,
                    IdOrigenCapital = proyeccionOriginal.IdOrigenCapital ?? 0,
                    Periodicidad = producto.Periocidad
                });

                for (int j = 0; j < simulacion.Cronograma.Count; j++)
                {
                    var cuotaSim = simulacion.Cronograma[j];
                    cuotaSim.Periodo = dto.PeriodoIncremento + j + 1;
                    // No modificar fechas para preservar cálculos correctos del simulador
                    nuevoCronograma.Add(cuotaSim);
                }

            }

            // 9. Crear nueva proyección de incremento
            var nuevaProyeccion = new Proyeccion
            {
                IdProducto = proyeccionOriginal.IdProducto,
                Capital = nuevaCuotaIncremento.CapitalFinal,
                AporteAdicional = dto.MontoIncremento,
                Plazo = proyeccionOriginal.Plazo,
                FechaInicial = proyeccionOriginal.FechaInicial,
                Tasa = configuracion.Taza,
                CosteOperativo = proyeccionOriginal.CosteOperativo,
                CosteNotarizacion = proyeccionOriginal.CosteNotarizacion,
                IdConfiguracionesProducto = configuracion.IdConfiguraciones,
                IdOrigenCapital = proyeccionOriginal.IdOrigenCapital,
                IdOrigenIncremento = proyeccionOriginal.IdOrigenIncremento,
                IdSolicitudInversion = proyeccionOriginal.IdSolicitudInversion,
                IdUsuarioCreacion = dto.IdUsuario,
                FechaCreacion = DateTime.Now,
                ProyeccionNombre = $"{proyeccionOriginal.ProyeccionNombre} (Incremento)"
            };
            _context.Proyeccion.Add(nuevaProyeccion);
            await _context.SaveChangesAsync();

            // 10. Guardar el nuevo cronograma como nuevo registro
            var cronogramaNuevo = new CronogramaProyeccion
            {
                IdProyeccion = nuevaProyeccion.IdProyeccion,
                PeriodosJson = JsonSerializer.Serialize(nuevoCronograma),
                FechaCreacion = DateTime.Now,
                EsActivo = true,
                Version = cronogramaOriginal.Version + 1,
                ReferenciaOriginal = cronogramaOriginal.IdCronogramaProyeccion
            };
            _context.CronogramaProyeccion.Add(cronogramaNuevo);

            // 11. Actualizar totales de la nueva proyección
            // (Puedes recalcular los totales si lo necesitas, aquí ejemplo)
            nuevaProyeccion.TotalRentabilidad = nuevoCronograma.Sum(x => x.Rentabilidad);
            nuevaProyeccion.TotalCosteOperativo = nuevoCronograma.Sum(x => x.CostoOperativo);
            nuevaProyeccion.TotalRentaPeriodo = nuevoCronograma.Sum(x => x.RentaPeriodo);
            nuevaProyeccion.RendimientosMasCapital = nuevoCronograma.Last().CapitalRenta;
            nuevaProyeccion.ValorProyectadoLiquidar = nuevoCronograma.Last().MontoPagar;
            nuevaProyeccion.TotalAporteAdicional = nuevoCronograma.Sum(x => x.AporteAdicional);
            nuevaProyeccion.FechaIncremento = nuevaCuotaIncremento.FechaInicial;
            nuevaProyeccion.FechaVencimiento = nuevoCronograma.Last().FechaVencimiento;

            _context.Proyeccion.Update(nuevaProyeccion);

            // 12. Guardar en base de datos
            await _context.SaveChangesAsync();

            // 13. Mapear resultado para frontend
            var result = new ProyeccionIncrementoResultDto
            {
                IdProyeccionNueva = nuevaProyeccion.IdProyeccion,
                IdCronogramaProyeccionNueva = cronogramaNuevo.IdCronogramaProyeccion,
                Proyeccion = new ProyeccionDetalleDto
                {
                    IdProyeccion = nuevaProyeccion.IdProyeccion,
                    ProyeccionNombre = nuevaProyeccion.ProyeccionNombre,
                    IdProducto = nuevaProyeccion.IdProducto,
                    Capital = nuevaProyeccion.Capital,
                    AporteAdicional = nuevaProyeccion.AporteAdicional,
                    Plazo = nuevaProyeccion.Plazo,
                    FechaInicial = nuevaProyeccion.FechaInicial,
                    FechaVencimiento = nuevaProyeccion.FechaVencimiento,
                    Tasa = nuevaProyeccion.Tasa,
                    CosteOperativo = nuevaProyeccion.CosteOperativo,
                    CosteNotarizacion = nuevaProyeccion.CosteNotarizacion,
                    TotalRentabilidad = nuevaProyeccion.TotalRentabilidad,
                    TotalCosteOperativo = nuevaProyeccion.TotalCosteOperativo,
                    TotalRentaPeriodo = nuevaProyeccion.TotalRentaPeriodo,
                    RendimientosMasCapital = nuevaProyeccion.RendimientosMasCapital,
                    ValorProyectadoLiquidar = nuevaProyeccion.ValorProyectadoLiquidar,
                    TotalAporteAdicional = nuevaProyeccion.TotalAporteAdicional,
                    FechaIncremento = nuevaProyeccion.FechaIncremento
                },
                Cronograma = nuevoCronograma
            };

            return result;
        }

    }
}
