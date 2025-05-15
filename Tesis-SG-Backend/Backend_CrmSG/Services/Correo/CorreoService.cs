using System.Net.Mail;
using System.Net;

namespace Backend_CrmSG.Services.Correo
{
    public class CorreoService : ICorreoService
    {
        private readonly IConfiguration _configuration;

        public CorreoService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> EnviarCorreoValidacion(string correoDestino, string hashValidacion)
        {
            try
            {
                var smtpClient = new SmtpClient(_configuration["Smtp:Host"])
                {
                    Port = int.Parse(_configuration["Smtp:Port"] ?? "587"),
                    Credentials = new NetworkCredential(
                        _configuration["Smtp:User"],
                        _configuration["Smtp:Password"]
                    ),
                    EnableSsl = true
                };

                var urlValidacion = $"{_configuration["App:FrontendUrl"]}/register?token={hashValidacion}";
                var from = _configuration["Smtp:From"];
                if (string.IsNullOrWhiteSpace(from))
                    throw new InvalidOperationException("La dirección 'From' no está configurada en appsettings.");

                var htmlBody = $@"
<!DOCTYPE html>
<html lang='es'>
<head>
  <meta charset='UTF-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <title>Activación de cuenta</title>
</head>
<body style='margin:0;padding:0;background:#000;font-family:Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' role='presentation'>
    <tr>
      <td align='center' style='padding: 20px 0;'>
        <img src='https://i.imgur.com/RIRBoCu.png' alt='SG Consulting Group' style='max-width: 100%; height: auto; display: block;' />
      </td>
    </tr>
    <tr>
      <td align='center'>
        <table width='600' cellpadding='0' cellspacing='0' style='background:white;border-radius:12px;max-width:90%;'>
          <tr>
            <td style='padding: 40px 30px; text-align: center;'>
              <img src='https://i.imgur.com/sDlNxtN.png' alt='Activar cuenta' width='180' style='margin: 0 auto 30px; display:block;' />
              <h1 style='font-size: 24px; color: #000; margin-bottom: 20px;'>Activa tu cuenta</h1>
              <p style='font-size: 14px; color: #333; line-height: 1.6; margin: 0 0 30px;'>
                Es momento de validar tu cuenta para poder acceder a nuestros productos. Si no has realizado el registro, puedes omitir este mensaje. 
                Se eliminará automáticamente en el transcurso de 2 días.
              </p>
              <a href='{urlValidacion}' 
                 style='display:inline-block;background:#000;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;'>
                Activar cuenta
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align='center' style='padding: 30px 0; font-size: 12px; color: #888;'>
        © 2025 SG CONSULTING GROUP. Todos los derechos reservados.
      </td>
    </tr>
  </table>
</body>
</html>";

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(from),
                    Subject = "Validación de correo electrónico",
                    Body = htmlBody,
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(correoDestino);

                await smtpClient.SendMailAsync(mailMessage);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
