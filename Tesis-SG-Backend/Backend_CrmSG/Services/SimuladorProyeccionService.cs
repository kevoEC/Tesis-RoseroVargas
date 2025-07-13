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

            // Para renta periódica, controla cada cuando toca pagar/cobrar
            int periodosDesdeUltimoPago = 0;

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
                if (origenEsLocal && cuota.Periodo == 1)
                {
                    cuota.Rentabilidad = 0; // El primer periodo local no genera rentabilidad
                }
                else
                {
                    cuota.Rentabilidad = decimal.Round(cuota.MontoOperacion * cuota.Tasa / 100, 2);
                }

                cuota.CostoNotarizacion = cuota.UltimaCuota ? costeNotarizacion : 0;
                rentabilidadAcumuladaParaCoste += cuota.Rentabilidad;

                // --- CUANDO TOCA PAGAR RENTA Y COBRAR COSTO OPERATIVO ---
                bool tocaPagar = false;

                // 1. Si periodicidad=0: renta y coste solo en la última cuota
                // 2. Si periodicidad>0: renta y coste cada "periodicidad" meses
                if (periodicidad == 0)
                {
                    tocaPagar = cuota.UltimaCuota;
                }
                else
                {
                    periodosDesdeUltimoPago++;
                    if (periodosDesdeUltimoPago == periodicidad || cuota.UltimaCuota)
                    {
                        tocaPagar = true;
                    }
                }

                cuota.PagaRenta = tocaPagar;

                if (tocaPagar)
                {
                    cuota.CostoOperativo = decimal.Round(rentabilidadAcumuladaParaCoste * 0.05m, 2);

                    if (periodicidad == 0 && cuota.UltimaCuota)
                    {
                        cuota.RentaPeriodo = Math.Max(cuota.Rentabilidad - cuota.CostoOperativo, 0);
                    }
                    else
                    {
                        cuota.RentaPeriodo = Math.Max(rentabilidadAcumuladaParaCoste - cuota.CostoOperativo, 0);
                    }

                    rentabilidadAcumuladaParaCoste = 0; // Se limpia el acumulado tras el pago
                    periodosDesdeUltimoPago = 0; // Resetea el contador de períodos
                }
                else
                {
                    cuota.CostoOperativo = 0;
                    cuota.RentaPeriodo = cuota.Rentabilidad;
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
