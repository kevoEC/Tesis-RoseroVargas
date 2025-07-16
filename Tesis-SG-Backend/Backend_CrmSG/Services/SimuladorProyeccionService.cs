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

            // NUEVO: para mostrar la rentabilidad sólo en el mes de pago
#pragma warning disable CS0219 // La variable está asignada pero nunca se usa su valor
            decimal rentabilidadMesPago = 0;
#pragma warning restore CS0219 // La variable está asignada pero nunca se usa su valor

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

                // --- CALCULO DE RENTABILIDAD REAL ---
                decimal rentabilidadCalculada = 0;
                if (origenEsLocal && cuota.Periodo == 1 && !request.EsIncremento)
                {
                    rentabilidadCalculada = 0; // El primer periodo local no genera rentabilidad en inversiones normales
                }
                else
                {
                    rentabilidadCalculada = decimal.Round(cuota.MontoOperacion * cuota.Tasa / 100, 2);
                }

                rentabilidadAcumuladaParaCoste += rentabilidadCalculada;

                // --- CONTROL DE PAGOS PERIÓDICOS ---
                bool tocaPagar = false;
                if (periodicidad == 0)
                {
                    tocaPagar = cuota.UltimaCuota;
                }
                else if (periodicidad == 1)
                {
                    periodosDesdeUltimoPago++;
                    if (periodosDesdeUltimoPago == 1 || cuota.UltimaCuota)
                    {
                        tocaPagar = true;
                        periodosDesdeUltimoPago = 0;
                    }
                }
                else
                {
                    if (origenEsLocal && i == 0)
                    {
                        // Primer mes local: NO cuentes todavía
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

                // --- RENTABILIDAD Y RENTA PERIODO SEGÚN PERIODICIDAD ---
                if (periodicidad > 1)
                {
                    // En meses normales (NO de pago), rentabilidad = 0
                    // En mes de pago, la acumulada desde el último pago
                    if (tocaPagar)
                    {
                        cuota.Rentabilidad = rentabilidadAcumuladaParaCoste;
                        cuota.CostoOperativo = decimal.Round(rentabilidadAcumuladaParaCoste * 0.05m, 2);
                        cuota.RentaPeriodo = Math.Max(rentabilidadAcumuladaParaCoste - cuota.CostoOperativo, 0);

                        rentabilidadAcumuladaParaCoste = 0; // Limpiar acumulador tras el pago
                    }
                    else
                    {
                        cuota.Rentabilidad = 0;
                        cuota.CostoOperativo = 0;
                        cuota.RentaPeriodo = 0;
                    }
                }
                else
                {
                    // Mensual o única, comportamiento tradicional
                    cuota.Rentabilidad = rentabilidadCalculada;
                    if (tocaPagar)
                    {
                        cuota.CostoOperativo = decimal.Round(rentabilidadAcumuladaParaCoste * 0.05m, 2);
                        if (periodicidad == 0 && cuota.UltimaCuota)
                            cuota.RentaPeriodo = Math.Max(cuota.Rentabilidad - cuota.CostoOperativo, 0);
                        else
                            cuota.RentaPeriodo = Math.Max(rentabilidadAcumuladaParaCoste - cuota.CostoOperativo, 0);
                        rentabilidadAcumuladaParaCoste = 0;
                    }
                    else
                    {
                        cuota.CostoOperativo = 0;
                        cuota.RentaPeriodo = cuota.Rentabilidad;
                    }
                }

                // --- RENTA ACUMULADA SIEMPRE MENSUAL ---
                rentaAcumuladaTotal += cuota.RentaPeriodo;
                cuota.RentaAcumulada = rentaAcumuladaTotal;

                cuota.CostoNotarizacion = cuota.UltimaCuota ? costeNotarizacion : 0;
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

                totalRentabilidad += cuota.Rentabilidad;
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
