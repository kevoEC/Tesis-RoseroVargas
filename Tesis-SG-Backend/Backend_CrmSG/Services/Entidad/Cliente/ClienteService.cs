using Backend_CrmSG.Data;
using Backend_CrmSG.Models;
using Backend_CrmSG.Models.Vistas;
using Backend_CrmSG.DTOs; // Donde está ClienteUpdateDTO
using Microsoft.EntityFrameworkCore;
using Backend_CrmSG.Services.Entidad;

public class ClienteService : IClienteService
{
    private readonly AppDbContext _context;

    public ClienteService(AppDbContext context)
    {
        _context = context;
    }

    // GET todos los clientes (vista enriquecida)
    public async Task<List<ClienteDetalle>> ObtenerTodosAsync()
        => await _context.ClienteDetalle.ToListAsync();

    // GET cliente por id (vista)
    public async Task<ClienteDetalle?> ObtenerPorIdAsync(int id)
        => await _context.ClienteDetalle
               .FirstOrDefaultAsync(x => x.IdCliente == id);

    // GET por propietario (vista)
    public async Task<List<ClienteDetalle>> ObtenerPorPropietarioAsync(int idUsuarioPropietario)
        => await _context.ClienteDetalle
               .Where(x => x.IdUsuarioPropietario == idUsuarioPropietario)
               .ToListAsync();

    // PUT/UPDATE completo (solo campos editables)
    public async Task ActualizarClienteAsync(ClienteUpdateDTO dto)
    {
        // Cliente principal
        var cliente = await _context.Cliente.FindAsync(dto.IdCliente);
        if (cliente == null) throw new Exception("Cliente no encontrado");

        // Validar flag de actualización
        if (!cliente.ActualizacionDatos)
            throw new Exception("No está permitida la actualización de datos para este cliente.");

        // Solo campos editables (nunca nombres, documento, tipo)
        cliente.IdGenero = dto.IdGenero;
        cliente.IdEstadoCivil = dto.IdEstadoCivil;
        cliente.IdNacionalidad = dto.IdNacionalidad;
        cliente.IdNivelAcademico = dto.IdNivelAcademico;
        cliente.IdUsuarioModificacion = dto.IdUsuarioModificacion;
        cliente.FechaModificacion = DateTime.Now;
        cliente.ActualizacionDatos = false;


        // IMPORTANTE: Marcar actualización como realizada (flag a 0)
        cliente.ActualizacionDatos = false;

        // Contacto
        if (dto.Contacto != null)
        {
            var contacto = await _context.ClienteContacto.FindAsync(dto.IdCliente);
            if (contacto != null)
            {
                contacto.CorreoElectronico = dto.Contacto.CorreoElectronico ?? contacto.CorreoElectronico;
                contacto.TelefonoCelular = dto.Contacto.TelefonoCelular ?? contacto.TelefonoCelular;
                contacto.OtroTelefono = dto.Contacto.OtroTelefono ?? contacto.OtroTelefono;
                contacto.TelefonoFijo = dto.Contacto.TelefonoFijo ?? contacto.TelefonoFijo;
                contacto.IdTipoVia = dto.Contacto.IdTipoVia;
                contacto.CallePrincipal = dto.Contacto.CallePrincipal ?? contacto.CallePrincipal;
                contacto.NumeroDomicilio = dto.Contacto.NumeroDomicilio ?? contacto.NumeroDomicilio;
                contacto.CalleSecundaria = dto.Contacto.CalleSecundaria ?? contacto.CalleSecundaria;
                contacto.ReferenciaDomicilio = dto.Contacto.ReferenciaDomicilio ?? contacto.ReferenciaDomicilio;
                contacto.SectorBarrio = dto.Contacto.SectorBarrio ?? contacto.SectorBarrio;
                contacto.TiempoResidencia = dto.Contacto.TiempoResidencia;
                contacto.IdPaisResidencia = dto.Contacto.IdPaisResidencia;
                contacto.IdProvinciaResidencia = dto.Contacto.IdProvinciaResidencia;
                contacto.IdCiudadResidencia = dto.Contacto.IdCiudadResidencia;
                contacto.ResidenteOtroPais = dto.Contacto.ResidenteOtroPais;
                contacto.ContribuyenteEEUU = dto.Contacto.ContribuyenteEEUU;
                contacto.NumeroIdentificacionOtroPais = dto.Contacto.NumeroIdentificacionOtroPais ?? contacto.NumeroIdentificacionOtroPais;
                contacto.NumeroIdentificacionEEUU = dto.Contacto.NumeroIdentificacionEEUU ?? contacto.NumeroIdentificacionEEUU;
            }
        }

        // Actividad Económica
        if (dto.ActividadEconomica != null)
        {
            var actividad = await _context.ClienteActividadEconomica.FindAsync(dto.IdCliente);
            if (actividad != null)
            {
                actividad.IdActividadPrincipal = dto.ActividadEconomica.IdActividadPrincipal;
                actividad.IdActividadLugarTrabajo = dto.ActividadEconomica.IdActividadLugarTrabajo;
                actividad.LugarTrabajo = dto.ActividadEconomica.LugarTrabajo ?? actividad.LugarTrabajo;
                actividad.CorreoTrabajo = dto.ActividadEconomica.CorreoTrabajo ?? actividad.CorreoTrabajo;
                actividad.OtraActividad = dto.ActividadEconomica.OtraActividad ?? actividad.OtraActividad;
                actividad.Cargo = dto.ActividadEconomica.Cargo ?? actividad.Cargo;
                actividad.Antiguedad = dto.ActividadEconomica.Antiguedad;
                actividad.TelefonoTrabajo = dto.ActividadEconomica.TelefonoTrabajo ?? actividad.TelefonoTrabajo;
                actividad.FechaInicioActividad = dto.ActividadEconomica.FechaInicioActividad;
                actividad.DireccionTrabajo = dto.ActividadEconomica.DireccionTrabajo ?? actividad.DireccionTrabajo;
                actividad.ReferenciaDireccionTrabajo = dto.ActividadEconomica.ReferenciaDireccionTrabajo ?? actividad.ReferenciaDireccionTrabajo;
                actividad.EsPEP = dto.ActividadEconomica.EsPEP;
            }
        }

        // Cuenta bancaria
        if (dto.CuentaBancaria != null)
        {
            var cuenta = await _context.ClienteCuentaBancaria.FindAsync(dto.IdCliente);
            if (cuenta != null)
            {
                cuenta.IdBanco = dto.CuentaBancaria.IdBanco;
                cuenta.IdTipoCuenta = dto.CuentaBancaria.IdTipoCuenta;
                cuenta.NumeroCuenta = dto.CuentaBancaria.NumeroCuenta ?? cuenta.NumeroCuenta;
            }
        }

        // Datos Económicos
        if (dto.DatosEconomicos != null)
        {
            var economico = await _context.ClienteEconomico.FindAsync(dto.IdCliente);
            if (economico != null)
            {
                economico.TotalIngresosMensuales = dto.DatosEconomicos.TotalIngresosMensuales;
                economico.TotalEgresosMensuales = dto.DatosEconomicos.TotalEgresosMensuales;
                economico.TotalActivos = dto.DatosEconomicos.TotalActivos;
                economico.TotalPasivos = dto.DatosEconomicos.TotalPasivos;
                economico.ActivosMuebles = dto.DatosEconomicos.ActivosMuebles;
                economico.ActivosInmuebles = dto.DatosEconomicos.ActivosInmuebles;
                economico.ActivosTitulosValor = dto.DatosEconomicos.ActivosTitulosValor;
                economico.IngresosFijos = dto.DatosEconomicos.IngresosFijos;
                economico.IngresosVariables = dto.DatosEconomicos.IngresosVariables;
                economico.OrigenIngresoVariable = dto.DatosEconomicos.OrigenIngresoVariable;
                economico.PatrimonioNeto = dto.DatosEconomicos.PatrimonioNeto;
            }
        }

        await _context.SaveChangesAsync();
    }

}
