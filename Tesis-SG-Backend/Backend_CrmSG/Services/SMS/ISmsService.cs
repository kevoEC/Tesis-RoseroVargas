namespace Backend_CrmSG.Services.SMS
{
    public interface ISmsService
    {
        Task<bool> EnviarCodigoValidacion(string numeroDestino, string mensaje);
    }


}
