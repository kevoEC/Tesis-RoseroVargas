using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Microsoft.Extensions.Configuration;
using Backend_CrmSG.Services.SMS;
using Twilio.Types;

public class TwilioSmsService : ISmsService
{
    private readonly IConfiguration _configuration;

    public TwilioSmsService(IConfiguration configuration)
    {
        _configuration = configuration;

        TwilioClient.Init(
            _configuration["Twilio:AccountSid"],
            _configuration["Twilio:AuthToken"]
        );
    }

    public async Task<bool> EnviarCodigoValidacion(string numeroDestino, string mensaje)
    {
        try
        {
            var message = await MessageResource.CreateAsync(
                body: mensaje,
                from: new PhoneNumber(_configuration["Twilio:FromPhone"]),
                to: new PhoneNumber(numeroDestino)
            );

            return message.ErrorCode == null;
        }
        catch
        {
            return false;
        }
    }

}
