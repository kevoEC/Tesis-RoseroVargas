using Backend_CrmSG.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

public class ContratoSecuencialService
{
    private readonly AppDbContext _context;

    public ContratoSecuencialService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<string> GenerarObtenerNumeroContratoAsync(int idSolicitudInversion, int idProyeccion)
    {
        // 1. Consultar si ya existe
        var resultado = await _context.ContratoSecuencial
            .Where(x => x.IdSolicitudInversion == idSolicitudInversion && x.IdProyeccion == idProyeccion)
            .Select(x => x.NumeroContrato)
            .FirstOrDefaultAsync();

        if (!string.IsNullOrEmpty(resultado))
            return resultado;

        // 2. Si NO existe, ejecutar el SP para generarlo
        var paramIdSolicitud = new SqlParameter("@IdSolicitudInversion", idSolicitudInversion);
        var paramIdProyeccion = new SqlParameter("@IdProyeccion", idProyeccion);
        var paramAnio = new SqlParameter("@Anio", System.Data.SqlDbType.Int) { Direction = System.Data.ParameterDirection.Output };
        var paramNumeroContrato = new SqlParameter("@NumeroContrato", System.Data.SqlDbType.VarChar, 30) { Direction = System.Data.ParameterDirection.Output };

        await _context.Database.ExecuteSqlRawAsync(
            "EXEC sp_GenerarNumeroContrato @IdSolicitudInversion, @IdProyeccion, @Anio OUTPUT, @NumeroContrato OUTPUT",
            paramIdSolicitud, paramIdProyeccion, paramAnio, paramNumeroContrato
        );

        // 3. Devolver el número de contrato generado (o vacío si hubo problema)
        return paramNumeroContrato.Value?.ToString() ?? "";
    }
}
