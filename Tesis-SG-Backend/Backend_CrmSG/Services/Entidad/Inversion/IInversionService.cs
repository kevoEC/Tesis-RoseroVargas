using Backend_CrmSG.Models.Vistas;

namespace Backend_CrmSG.Services.Entidad.Inversion
{
    public interface IInversionService
    {
        Task<List<InversionDetalle>> ObtenerTodasAsync();
        Task<InversionDetalle?> ObtenerPorIdAsync(int id);
        Task<List<InversionDetalle>> ObtenerPorPropietarioAsync(int idUsuarioPropietario);
        Task<List<InversionDetalle>> ObtenerPorClienteAsync(int idCliente);

    }

}
