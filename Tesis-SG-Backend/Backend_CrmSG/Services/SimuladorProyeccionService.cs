using Backend_CrmSG.DTOs;

namespace Backend_CrmSG.Services
{
    public class SimuladorProyeccionService
    {
        public SimulacionResult ObtenerSimulacion(SimulacionRequest request)
        {
            var cronogramalist = new List<CronogramaCuotaDto>();

            decimal capital = request.Capital;
            DateTime fechaInicio = request.FechaInicial;
            short plazo = request.Plazo;
            decimal tasa = request.Tasa;
            decimal aporteAdicional = request.AporteAdicional;
            decimal costeNotarizacion = request.CosteNotarizacion;
            bool origenEsLocal = request.IdOrigenCapital == 1; // Local o Extranjero
            int periodicidad = request.Periodicidad; // 0=único pago final, 1=mensual, 2=bimestral, etc.

            decimal totalRentabilidad = 0;
            decimal totalCosteOperativo = 0;
            decimal totalAporteAdicional = 0;
            DateTime? fechaIncremento = null;

            decimal rentabilidadAcumuladaParaCoste = 0;
            decimal rentaAcumuladaTotal = 0;

            // Control de pagos periódicos
            int periodosDesdeUltimoPago = 0;

            // NUEVA VARIABLE: Para mostrar la rentabilidad sólo al pagar (para periodicidad > 1)
            decimal rentabilidadAcumuladaParaMostrar = 0;

            for (int i = 0; i < plazo; i++)
            {
                var cuota = new CronogramaCuotaDto
                {
                    Periodo = i + 1,
                    FechaInicial = fechaInicio.AddMonths(i),
                    FechaVencimiento = fechaInicio.AddMonths(i + 1),
                    Tasa = tasa,
                    Capital = capital,
                    AporteMensual = 0,
                    AporteAdicional = (i == 0) ? aporteAdicional : 0,
                    UltimaCuota = (i + 1 == plazo)
                };

                cuota.AporteOperacion = cuota.AporteMensual;
                cuota.AporteOperacionAdicional = cuota.AporteAdicional;
                cuota.CapitalOperacion = cuota.Capital;
                cuota.MontoOperacion = cuota.CapitalOperacion + cuota.AporteOperacion + cuota.AporteOperacionAdicional;

                // --- CALCULO DE RENTABILIDAD ---
                decimal rentabilidadCalculada = 0;
                if (origenEsLocal && cuota.Periodo == 1)
                {
                    rentabilidadCalculada = 0; // El primer periodo local no genera rentabilidad
                }
                else
                {
                    rentabilidadCalculada = decimal.Round(cuota.MontoOperacion * cuota.Tasa / 100, 2);
                }

                cuota.CostoNotarizacion = cuota.UltimaCuota ? costeNotarizacion : 0;
                rentabilidadAcumuladaParaCoste += rentabilidadCalculada;
                rentabilidadAcumuladaParaMostrar += rentabilidadCalculada; // Para mostrar solo en el periodo de pago

                // --- CONTROL DE PAGOS PERIÓDICOS ---
                bool tocaPagar = false;

                if (periodicidad == 0)
                {
                    // Pago único al final
                    tocaPagar = cuota.UltimaCuota;
                }
                else if (periodicidad == 1)
                {
                    // Mensual, pago cada mes, no hay desfase
                    periodosDesdeUltimoPago++;
                    if (periodosDesdeUltimoPago == 1 || cuota.UltimaCuota)
                    {
                        tocaPagar = true;
                        periodosDesdeUltimoPago = 0;
                    }
                }
                else
                {
                    // Periódica > 1 (bimestral, trimestral, semestral, etc.)
                    if (origenEsLocal && i == 0)
                    {
                        // Primer mes local: NO cuentes todavía, arranca el contador en el siguiente mes
                        // periodosDesdeUltimoPago sigue en 0
                    }
                    else
                    {
                        periodosDesdeUltimoPago++;
                    }

                    if (periodosDesdeUltimoPago == periodicidad || cuota.UltimaCuota)
                    {
                        tocaPagar = true;
                        periodosDesdeUltimoPago = 0;
                    }
                }

                cuota.PagaRenta = tocaPagar;

                // --- RENTA Y COSTE OPERATIVO ---
                if (tocaPagar)
                {
                    cuota.CostoOperativo = decimal.Round(rentabilidadAcumuladaParaCoste * 0.05m, 2);

                    if (periodicidad == 0 && cuota.UltimaCuota)
                    {
                        cuota.RentaPeriodo = Math.Max(rentabilidadCalculada - cuota.CostoOperativo, 0);
                    }
                    else
                    {
                        cuota.RentaPeriodo = Math.Max(rentabilidadAcumuladaParaCoste - cuota.CostoOperativo, 0);
                    }

                    // --- RENTABILIDAD SOLO SE MUESTRA AL PAGAR SI PERIODICIDAD > 1 ---
                    if (periodicidad > 1)
                        cuota.Rentabilidad = rentabilidadAcumuladaParaMostrar;
                    else
                        cuota.Rentabilidad = rentabilidadCalculada;

                    rentabilidadAcumuladaParaCoste = 0; // Se limpia el acumulado tras el pago
                    rentabilidadAcumuladaParaMostrar = 0; // Se limpia el acumulado para mostrar tras el pago
                }
                else
                {
                    cuota.CostoOperativo = 0;
                    cuota.RentaPeriodo = rentabilidadCalculada;
                    // RENTABILIDAD SE MUESTRA SOLO SI ES MENSUAL O ÚNICO, SINO SE PONE EN 0
                    if (periodicidad > 1)
                        cuota.Rentabilidad = 0;
                    else
                        cuota.Rentabilidad = rentabilidadCalculada;
                }

                rentaAcumuladaTotal += cuota.RentaPeriodo;
                cuota.RentaAcumulada = rentaAcumuladaTotal;

                cuota.CapitalRenta = cuota.Capital + cuota.Rentabilidad;

                // --- MONTO A PAGAR ---
                if (cuota.PagaRenta)
                {
                    if (cuota.UltimaCuota)
                    {
                        if (periodicidad == 0)
                            cuota.MontoPagar = cuota.CapitalRenta - cuota.CostoOperativo;
                        else
                            cuota.MontoPagar = cuota.Capital + cuota.RentaPeriodo;
                    }
                    else
                    {
                        cuota.MontoPagar = cuota.RentaPeriodo;
                    }
                }
                else
                {
                    cuota.MontoPagar = 0;
                }

                cuota.CapitalFinal = cuota.UltimaCuota
                    ? 0
                    : (periodicidad == 0
                        ? cuota.Capital + cuota.RentaPeriodo
                        : cuota.Capital);

                if (cuota.AporteAdicional > 0 && fechaIncremento == null)
                    fechaIncremento = cuota.FechaInicial;

                cronogramalist.Add(cuota);

                // TOTAL RENTABILIDAD SIEMPRE SUMA LA REAL, NO LA VISUAL
                totalRentabilidad += rentabilidadCalculada;
                totalCosteOperativo += cuota.CostoOperativo;
                totalAporteAdicional += cuota.AporteAdicional;

                capital = cuota.CapitalFinal;
            }

            return new SimulacionResult
            {
                FechaInicio = request.FechaInicial,
                FechaIncremento = fechaIncremento,
                TotalAporteAdicional = totalAporteAdicional,
                TotalRentaPeriodo = cronogramalist.Sum(c => c.RentaPeriodo),
                TotalCosteOperativo = cronogramalist.Sum(c => c.CostoOperativo),
                TotalRentabilidad = totalRentabilidad,
                RendimientoCapital = cronogramalist.Last().CapitalRenta,
                ValorProyectadoLiquidar = cronogramalist.Last().MontoPagar,
                Cronograma = cronogramalist
            };
        }

    }

}
