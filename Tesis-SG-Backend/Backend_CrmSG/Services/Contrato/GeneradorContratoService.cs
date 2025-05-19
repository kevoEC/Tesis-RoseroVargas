using System.Text;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Backend_CrmSG.Data;
using Backend_CrmSG.Helpers;
using System.IO;
using System.Linq;

public class GeneradorContratoService
{
    private readonly AppDbContext _context;

    public GeneradorContratoService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<bool> GenerarContratoDesdeTareaAsync(int IdSolicitudInversion)
    {
        var tarea = await _context.Tarea.FindAsync(IdSolicitudInversion)
            ?? throw new Exception("Tarea no encontrada.");

        if (tarea.IdTipoTarea != 1)
            throw new Exception("Tarea no es de tipo Revisión Documental.");

        var solicitud = await _context.SolicitudesInversionDetalle
            .FirstOrDefaultAsync(s => s.IdSolicitudInversion == tarea.IdSolicitudInversion)
            ?? throw new Exception("Solicitud vinculada no encontrada.");

        var proyeccion = await _context.Proyeccion
            .FirstOrDefaultAsync(p => p.IdProyeccion == solicitud.IdProyeccionSeleccionada)
            ?? throw new Exception("Proyección no encontrada.");

        var beneficiarios = await _context.Beneficiario
            .Where(b => b.IdSolicitudInversion == solicitud.IdSolicitudInversion).ToListAsync();

        var documento = await _context.Documento
            .FirstOrDefaultAsync(d => d.IdTarea == IdSolicitudInversion && d.IdTipoDocumento == 22)
            ?? throw new Exception("Documento Contrato/Adendum no encontrado.");

        // ==== DATOS A REEMPLAZAR ====
        string nombreCompleto = $"{solicitud.ApellidoPaterno} {solicitud.ApellidoMaterno} {solicitud.Nombres}".Trim().ToUpper();
        string numeroContrato = solicitud.NumeroContrato ?? "";
        decimal capital = proyeccion.Capital;
        int plazo = proyeccion.Plazo;
        DateTime fechaInicial = proyeccion.FechaInicial;

        string inversionLetras = ConvertirNumeroALetras(capital);
        int centavosInt = (int)((capital - Math.Truncate(capital)) * 100);
        string centavosLetras = ConvertirNumeroALetras(centavosInt);

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
        string diaLetras = ConvertirNumeroALetras(fechaInicial.Day);
        string plazoLetras = ConvertirNumeroALetras(plazo);

        // ==== GENERACIÓN DE WORD ====
        var plantillaPath = Path.Combine("Plantillas", "PlantillaContratoTESIS.docx");
        byte[] wordBytes;

        using (var ms = new MemoryStream())
        {
            using (var plantilla = WordprocessingDocument.Open(plantillaPath, false))
            {
                plantilla.Clone(ms);
            }

            using (var doc = WordprocessingDocument.Open(ms, true))
            {
                var body = doc.MainDocumentPart?.Document?.Body ?? throw new Exception("Error al leer el contenido Word.");

                var reemplazos = new Dictionary<string, string>
                {
                    ["numeroContrato"] = numeroContrato,
                    ["texto_apoderado"] = "quien es representado por su APODERADA ESPECIAL la señora SUASTI OÑA ANA GABRIELA, como se puede verificar en el poder especial que se adjunta como habilitante, mayor de edad, de nacionalidad ecuatoriana, titular de la Cédula de Ciudadanía No. 1722738190",
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
                    ["domicilio"] = domicilio,
                    ["correo"] = solicitud.CorreoElectronico ?? "",
                    ["telefono"] = solicitud.TelefonoCelular ?? "",
                    ["diaFecha"] = dia,
                    ["diaFechaletras"] = diaLetras,
                    ["mesFecha"] = mes,
                    ["anoFecha"] = anio,
                    ["nombreApoderado"] = "ANA GABRIELA SUASTI OÑA",
                    ["tipoDocApoderado"] = "CI",
                    ["numDocApoderado"] = "1722738190",
                    ["textoApoderado2"] = "APODERADA ESPECIAL",
                    ["nombreCompleto4"] = nombreCompleto,
                    ["TipoDocu2"] = solicitud.NombreTipoDocumento ?? "",
                    ["numeroDocu2"] = solicitud.NumeroDocumento ?? ""
                };

                // Beneficiarios
                for (int i = 0; i < beneficiarios.Count; i++)
                {
                    reemplazos[$"Nombre_completo_beneficiario_{i + 1}"] = beneficiarios[i].Nombre?.ToUpper() ?? "";
                    reemplazos[$"Porcentaje_beneficio_{i + 1}"] = beneficiarios[i].PorcentajeBeneficio.ToString("N2");
                }

                foreach (var par in reemplazos)
                {
                    var textos = body.Descendants<DocumentFormat.OpenXml.Wordprocessing.Text>()
                        .Where(t => t.Text.Contains($"{{{{{par.Key}}}}}"));

                    foreach (var text in textos)
                        text.Text = text.Text.Replace($"{{{{{par.Key}}}}}", par.Value);
                }

                doc.MainDocumentPart.Document.Save();
            }

            wordBytes = ms.ToArray();
        }

        documento.Archivo = wordBytes;
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
