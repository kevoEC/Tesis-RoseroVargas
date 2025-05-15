namespace Backend_CrmSG.Services.Correo
{
    public interface ICorreoService
    {
        Task<bool> EnviarCorreoValidacion(string correoDestino, string hashValidacion);
    }

}
