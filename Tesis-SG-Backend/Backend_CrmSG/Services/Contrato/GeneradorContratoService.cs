using System.Globalization;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Backend_CrmSG.Data;
using Backend_CrmSG.Helpers;
using Microsoft.EntityFrameworkCore;
using Backend_CrmSG.Models.Entidades;

public class GeneradorContratoService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public GeneradorContratoService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task<bool> GenerarContratoDesdeSolicitudAsync(int idSolicitudInversion)
    {
        // 1. Obtener la última tarea de tipo 1 para esa solicitud
        var tarea = await _context.Tarea
            .Where(t => t.IdSolicitudInversion == idSolicitudInversion && t.IdTipoTarea == 1)
            .OrderByDescending(t => t.FechaCreacion)
            .FirstOrDefaultAsync();

        if (tarea == null)
            throw new Exception("No se encontró la tarea de tipo Revisión Documental para la solicitud.");

        // 2. Usar la vista enriquecida
        var solicitud = await _context.SolicitudesInversionDetalle
            .FirstOrDefaultAsync(s => s.IdSolicitudInversion == idSolicitudInversion)
            ?? throw new Exception("Vista enriquecida de solicitud no encontrada.");

        var proyeccion = await _context.Proyeccion
            .FirstOrDefaultAsync(p => p.IdProyeccion == solicitud.IdProyeccionSeleccionada)
            ?? throw new Exception("Proyección no encontrada.");

        var beneficiarios = await _context.Beneficiario
            .Where(b => b.IdSolicitudInversion == idSolicitudInversion).ToListAsync();

        var documento = await _context.Documento
            .FirstOrDefaultAsync(d => d.IdTarea == tarea.IdTarea && d.IdTipoDocumento == 22)
            ?? throw new Exception("Documento tipo Contrato/Adendum no encontrado.");

        // 3. Reemplazos
        string nombreCompleto = $"{solicitud.ApellidoPaterno} {solicitud.ApellidoMaterno} {solicitud.Nombres}".Trim().ToUpper();
        decimal capital = proyeccion.Capital;
        DateTime fechaInicial = proyeccion.FechaInicial;
        int plazo = proyeccion.Plazo;

        string inversionLetras = ConvertirNumeroALetras(capital).ToUpper();
        string centavosLetras = ConvertirNumeroALetras((int)((capital - Math.Truncate(capital)) * 100)).ToUpper() + " CENTAVOS";
        string saludo1 = solicitud.IdTipoCliente == 2 ? "la empresa " :
                         solicitud.IdGenero == 1 ? "El Sr. " :
                         solicitud.IdGenero == 2 ? "La Sra. " : "";
        string saludo2 = solicitud.IdGenero == 1 ? "El Sr. " :
                         solicitud.IdGenero == 2 ? "La Sra. " : "";

        string tipoTerminacion = proyeccion.IdProducto == 1 ? "al finalizar" : "según su periocidad";
        string domicilio = $"{solicitud.CallePrincipal} - {solicitud.NumeroDomicilio} - {solicitud.CalleSecundaria} - {solicitud.NombreCiudadResidencia}".Trim();

        string dia = fechaInicial.Day.ToString("D2");
        string mes = fechaInicial.Month.ToString("D2");
        string anio = fechaInicial.Year.ToString();
        string diaLetras = ConvertirNumeroALetras(fechaInicial.Day).ToUpper();
        string plazoLetras = ConvertirNumeroALetras(plazo).ToUpper();

        string docs = string.Join("\r\n", beneficiarios.Select(b => "- " + (b.NumeroDocumento ?? "")));
        string nombres = string.Join("\r\n", beneficiarios.Select(b => "- " + (b.Nombre?.ToUpper() ?? "")));
        string porcentajes = string.Join("\r\n", beneficiarios.Select(b => "- " + b.PorcentajeBeneficio.ToString("N2", CultureInfo.InvariantCulture) + "%"));

        var reemplazos = new Dictionary<string, string>
        {
            ["numeroContrato"] = solicitud.NumeroContrato ?? "",
            ["textoApoderado"] = "quien es representado por su APODERADA ESPECIAL la señora SUASTI OÑA ANA GABRIELA, como se puede verificar en el poder especial que se adjunta como habilitante, mayor de edad, de nacionalidad ecuatoriana, titular de la Cédula de Ciudadanía No. 1722738190",
            ["saludo1"] = saludo1,
            ["nombreCompleto1"] = nombreCompleto,
            ["nacionalidad"] = solicitud.NombreNacionalidad ?? "",
            ["estadoCivil"] = solicitud.NombreEstadoCivil ?? "",
            ["tipoDocu1"] = solicitud.NombreTipoDocumento ?? "",
            ["numeroDocu1"] = solicitud.NumeroDocumento ?? "",
            ["canton"] = solicitud.NombreCiudadResidencia ?? "",
            ["celular"] = solicitud.TelefonoCelular ?? "",
            ["email"] = solicitud.CorreoElectronico ?? "",
            ["saludo2"] = saludo2,
            ["nombreCompleto2"] = nombreCompleto,
            ["inversion1"] = capital.ToString("N2"),
            ["inversion1Letras"] = inversionLetras,
            ["inversion1Centavos"] = centavosLetras,
            ["plazo"] = plazo.ToString(),
            ["plazoLetras"] = plazoLetras,
            ["tipoTerminacion"] = tipoTerminacion,
            ["nombreCompleto3"] = nombreCompleto,
            ["direccionCompleta"] = domicilio,
            ["emial2"] = solicitud.CorreoElectronico ?? "",
            ["celular2"] = solicitud.TelefonoCelular ?? "",
            ["diafecha"] = dia,
            ["diaFechaletras"] = diaLetras,
            ["mesFecha"] = mes,
            ["anoFecha"] = anio,
            ["nombreApoderado"] = "ANA GABRIELA SUASTI OÑA",
            ["tipoDocApoderado"] = "CI",
            ["numDocApoderado"] = "1722738190",
            ["textoApoderado2"] = "APODERADA ESPECIAL",
            ["nombreCompleto4"] = nombreCompleto,
            ["tipoDocu2"] = solicitud.NombreTipoDocumento ?? "",
            ["numeroDocu2"] = solicitud.NumeroDocumento ?? "",
            ["documentoBeneficiario"] = docs,
            ["nombreBeneficiario"] = nombres,
            ["porcentajeBeneficiario"] = porcentajes
        };

        // 4. Cargar plantilla y preparar memoria
        string plantillaPath = Path.Combine(_env.ContentRootPath, "Plantillas", "PlantillaContratoTESIS.docx");
        if (!File.Exists(plantillaPath))
            throw new FileNotFoundException("Plantilla Word no encontrada.", plantillaPath);

        byte[] resultadoBytes;
        using (var plantillaStream = new MemoryStream())
        {
            using (var plantillaDoc = WordprocessingDocument.Open(plantillaPath, false))
            {
                plantillaDoc.Clone(plantillaStream);
            }

            using (var docx = WordprocessingDocument.Open(plantillaStream, true))
            {
                var body = docx.MainDocumentPart?.Document?.Body ?? throw new Exception("El documento no tiene contenido.");

                // Reemplazo de texto simple
                var tags = docx.MainDocumentPart?.Document?.Descendants<SdtElement>();
                if (tags != null)
                {
                    foreach (var sdt in tags)
                    {
                        var tag = sdt.SdtProperties?.GetFirstChild<Tag>()?.Val?.Value;
                        if (!string.IsNullOrWhiteSpace(tag) && reemplazos.TryGetValue(tag, out var valor))
                        {
                            var texto = sdt.Descendants<Text>().FirstOrDefault();
                            if (texto != null)
                                texto.Text = valor;
                        }
                    }
                }

            }

            resultadoBytes = plantillaStream.ToArray();
        }

        // 5. Guardar en la base
        documento.Archivo = resultadoBytes;
        _context.Update(documento);
        await _context.SaveChangesAsync();

        return true;
    }

    private string ConvertirNumeroALetras(decimal numero)
    {
        var letras = NumeroALetras.Convertir(numero);
        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(letras.ToLower());
    }
}