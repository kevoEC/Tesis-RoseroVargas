using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Microsoft.EntityFrameworkCore;

public class ContratoSecuencialService
{
    private readonly AppDbContext _context;

    public ContratoSecuencialService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerarObtenerNumeroContratoAsync(int idSolicitudInversion, int idProyeccion)
    {
        // Aquí ejecuta tu SP o lógica que retorna el número de contrato (como string)
        // Por ejemplo usando Dapper o FromSqlRaw sobre una entidad real (no DTO)
        var resultado = await _context.ContratoSecuencial
            .Where(x => x.IdSolicitudInversion == idSolicitudInversion && x.IdProyeccion == idProyeccion)
            .Select(x => x.NumeroContrato)
            .FirstOrDefaultAsync();

        return resultado ?? "";
    }

}
