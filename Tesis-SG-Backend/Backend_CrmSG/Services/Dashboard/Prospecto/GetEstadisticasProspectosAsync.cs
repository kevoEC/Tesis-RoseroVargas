using Backend_CrmSG.DTOs.Dashboard.Prospecto;
using Backend_CrmSG.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Services.Dashboard.Prospecto
{
    public class DashboardProspectoService
    {
        private readonly AppDbContext _context;

        public DashboardProspectoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EstadisticasProspectosDTO> GetEstadisticasProspectosAsync()
        {
            // 1. Prospectos activos/inactivos
            var activos = await _context.Prospecto.CountAsync(x => x.Estado == true);
            var inactivos = await _context.Prospecto.CountAsync(x => x.Estado != true);

            // 2. Prospectos convertidos/no convertidos
            var convertidos = await _context.Prospecto.CountAsync(x => x.EsCliente == true);
            var noConvertidos = await _context.Prospecto.CountAsync(x => x.EsCliente == false);


            // 3. Porcentaje conversión  
            int totalProspectos = await _context.Prospecto.CountAsync();
            double porcentajeConversion = totalProspectos == 0 ? 0 :
                (convertidos * 100.0 / totalProspectos);

            // 4. Prospectos por producto de interés  
            var porProductoInteres = await _context.ProspectosDetalle
                .GroupBy(x => x.ProductoInteres)
                .Select(g => new ProspectosPorProductoDTO
                {
                    ProductoInteres = g.Key ?? "No especificado",
                    Total = g.Count()
                }).ToListAsync();

            // 5. Prospectos por canal de origen  
            var porOrigen = await _context.ProspectosDetalle
                .GroupBy(x => x.NombreOrigen)
                .Select(g => new ProspectosPorOrigenDTO
                {
                    NombreOrigen = g.Key ?? "No especificado",
                    Total = g.Count()
                }).ToListAsync();

            // 6. Prospectos por mes (FechaCreacion puede ser null)  
            var porMes = await _context.Prospecto
                .Where(x => x.FechaCreacion.HasValue)
                .GroupBy(x => new { Año = x.FechaCreacion!.Value.Year, Mes = x.FechaCreacion!.Value.Month })
                .Select(g => new ProspectosPorMesDTO
                {
                    Año = g.Key.Año,
                    Mes = g.Key.Mes,
                    TotalProspectos = g.Count()
                }).OrderBy(x => x.Año).ThenBy(x => x.Mes)
                .ToListAsync();

            // 7. Prospectos con al menos una solicitud  
            int prospectosConSolicitud = await _context.SolicitudInversion
                .Where(x => x.IdProspecto.HasValue)
                .Select(x => x.IdProspecto!.Value) // Fix: Use null-forgiving operator (!)  
                .Distinct()
                .CountAsync();

            // 8. Prospectos sin ninguna solicitud  
            int prospectosSinSolicitud = await _context.Prospecto
                .CountAsync(p => !_context.SolicitudInversion.Any(s => s.IdProspecto == p.IdProspecto));

            return new EstadisticasProspectosDTO
            {
                Activos = activos,
                Inactivos = inactivos,
                Convertidos = convertidos,
                NoConvertidos = noConvertidos,
                PorcentajeConversion = porcentajeConversion,
                PorProductoInteres = porProductoInteres,
                PorOrigen = porOrigen,
                PorMes = porMes,
                ProspectosConSolicitud = prospectosConSolicitud,
                ProspectosSinSolicitud = prospectosSinSolicitud
            };
        }
    }
}
