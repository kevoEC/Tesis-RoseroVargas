using Backend_CrmSG.Data;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.DTOs.Backend_CrmSG.DTOs.Seguridad;
using Backend_CrmSG.DTOs.Seguridad;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

public class StoredProcedureService
{
    private readonly string _connectionString;
    public string ConnectionString => _connectionString;
    private readonly AppDbContext _context;
    private readonly GeneradorContratoService _generadorContratoService;
    private readonly GeneradorAnexoService _generadorAnexoService;


    public StoredProcedureService(IConfiguration configuration, AppDbContext context, GeneradorContratoService generadorContratoService, GeneradorAnexoService generadorAnexoService)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("La cadena de conexión 'DefaultConnection' no está configurada.");
        _context = context;
        _generadorContratoService = generadorContratoService;
        _generadorAnexoService = generadorAnexoService;
    }

    public async Task<LoginResultDto> EjecutarLoginSP(string email, string password)
    {
        var result = new LoginResultDto();

        using (var connection = new SqlConnection(_connectionString))
        {
            using (var cmd = new SqlCommand("sp_LoginUsuario", connection))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Email", email);
                cmd.Parameters.AddWithValue("@Password", password);

                await connection.OpenAsync();
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    // 1. Datos del usuario
                    if (await reader.ReadAsync())
                    {
                        result.Usuario = new UsuarioDto
                        {
                            Id = Convert.ToInt32(reader["IdUsuario"]),
                            Email = reader["Email"]?.ToString() ?? "",
                            NombreCompleto = reader["NombreCompleto"]?.ToString() ?? "",
                            Identificacion = reader["Identificacion"]?.ToString() ?? ""
                        };



                    }

                    // 2. Roles del usuario
                    if (await reader.NextResultAsync())
                    {
                        result.Roles = new List<string>();
                        while (await reader.ReadAsync())
                        {
                            result.Roles.Add(reader.GetString(0));
                        }
                    }

                    // 3. Permisos detallados
                    if (await reader.NextResultAsync())
                    {
                        result.Permisos = new List<PermisoDto>();
                        while (await reader.ReadAsync())
                        {
                            result.Permisos = new List<PermisoDto>();
                            while (await reader.ReadAsync())
                            {
                                result.Permisos.Add(new PermisoDto
                                {
                                    Menu = Convert.ToInt32(reader["Menu"]),
                                    Nombre = reader["Nombre"]?.ToString() ?? "",
                                    Ruta = reader["Ruta"]?.ToString() ?? "",
                                    Icono = reader["Icono"]?.ToString() ?? "",
                                    Permiso = Convert.ToInt32(reader["Permiso"])
                                });
                            }

                        }
                    }
                }
            }
        }

        return result;
    }

    public async Task<RegistroParcialResponseDTO?> EjecutarSpRegistrarUsuarioParcial(RegistroParcialDTO dto)
    {
        using var connection = new SqlConnection(_connectionString);
        using var command = new SqlCommand("sp_RegistrarUsuarioParcial", connection)
        {
            CommandType = CommandType.StoredProcedure
        };

        command.Parameters.AddWithValue("@Email", dto.Email);
        command.Parameters.AddWithValue("@Identificacion", dto.Identificacion);
        command.Parameters.AddWithValue("@PrimerNombre", dto.PrimerNombre);
        command.Parameters.AddWithValue("@SegundoNombre", (object?)dto.SegundoNombre ?? DBNull.Value);
        command.Parameters.AddWithValue("@PrimerApellido", dto.PrimerApellido);
        command.Parameters.AddWithValue("@SegundoApellido", (object?)dto.SegundoApellido ?? DBNull.Value);
        command.Parameters.AddWithValue("@Contrasena", dto.Contraseña);
        command.Parameters.AddWithValue("@TerminosAceptados", dto.TerminosAceptados);

        await connection.OpenAsync();
        using var reader = await command.ExecuteReaderAsync();

        if (await reader.ReadAsync())
        {
            return new RegistroParcialResponseDTO
            {
                IdUsuario = reader.GetInt32(reader.GetOrdinal("IdUsuario")),
                HashValidacion = reader.GetString(reader.GetOrdinal("HashValidacion")),
                Email = reader.GetString(reader.GetOrdinal("Email"))
            };
        }

        return null;
    }


    public async Task<(bool tareasGeneradas, bool contratoGenerado, int cantidadBeneficiarios)> EjecutarCrearTareasYContrato(int idSolicitud)
    {
        // 1. Ejecutar el SP que crea tareas y documentos
        using (var connection = new SqlConnection(_connectionString))
        using (var command = new SqlCommand("sp_CrearTareasPorSolicitudInversion", connection))
        {
            command.CommandType = CommandType.StoredProcedure;
            command.Parameters.AddWithValue("@IdSolicitudInversion", idSolicitud);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();
        }

        // 2. Buscar la tarea de tipo 1 recién creada
        var tarea = await _context.Tarea
            .Where(t => t.IdSolicitudInversion == idSolicitud && t.IdTipoTarea == 1)
            .OrderByDescending(t => t.FechaCreacion)
            .FirstOrDefaultAsync();

        if (tarea != null)
        {
            // 3. Generar contrato principal (IdTipoDocumento = 22)
            var contratoGenerado = await _generadorContratoService.GenerarContratoDesdeSolicitudAsync(idSolicitud);

            // 4. Generar Anexo (IdTipoDocumento = 11)
            var anexoGenerado = await _generadorAnexoService.GenerarAnexoDesdeSolicitudAsync(idSolicitud);

            // 5. Consultar cantidad de beneficiarios
            var cantidadBeneficiarios = await _context.BeneficiariosDetalle
                .CountAsync(b => b.IdSolicitudInversion == idSolicitud);

            return (true, contratoGenerado && anexoGenerado, cantidadBeneficiarios);
        }

        return (true, false, 0);
    }


}
