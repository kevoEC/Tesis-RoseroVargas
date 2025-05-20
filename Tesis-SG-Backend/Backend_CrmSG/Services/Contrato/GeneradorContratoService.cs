using System.Globalization;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Backend_CrmSG.Data;
using Backend_CrmSG.Helpers;
using Microsoft.EntityFrameworkCore;

public class GeneradorContratoService
{
    private readonly AppDbContext _context;

    public GeneradorContratoService(AppDbContext context)
    {
        _context = context;
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

        string inversionLetras = ConvertirNumeroALetras(capital);
        string centavosLetras = ConvertirNumeroALetras((int)((capital - Math.Truncate(capital)) * 100));
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

        var reemplazos = new Dictionary<string, string>
        {
            ["numeroContrato"] = solicitud.NumeroContrato ?? "",
            ["textoApoderado"] = "quien es representado por su APODERADA ESPECIAL la señora SUASTI OÑA ANA GABRIELA...",
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
            ["email2"] = solicitud.CorreoElectronico ?? "",
            ["celular2"] = solicitud.TelefonoCelular ?? "",
            ["diaFecha"] = dia,
            ["diaFechaletras"] = diaLetras,
            ["mesFecha"] = mes,
            ["anoFecha"] = anio,
            ["nombreApoderado"] = "ANA GABRIELA SUASTI OÑA",
            ["tipoDocApoderado"] = "CI",
            ["numDocApoderado"] = "1722738190",
            ["textoApoderado2"] = "APODERADA ESPECIAL",
            ["nombreCompleto4"] = nombreCompleto,
            ["tipoDocu2"] = solicitud.NombreTipoDocumento ?? "",
            ["numeroDocu2"] = solicitud.NumeroDocumento ?? ""
        };

        for (int i = 0; i < beneficiarios.Count; i++)
        {
            reemplazos[$"nombre_completo_beneficiario_{i + 1}"] = beneficiarios[i].Nombre?.ToUpper() ?? "";
            reemplazos[$"porcentaje_beneficio_{i + 1}"] = beneficiarios[i].PorcentajeBeneficio.ToString("N2");
        }

        // 4. Plantilla y reemplazo
        string plantillaPath = Path.Combine("Plantillas", "PlantillaContratoTESIS.docx");
        if (!File.Exists(plantillaPath))
            throw new FileNotFoundException("Plantilla Word no encontrada.", plantillaPath);

        byte[] resultadoBytes;
        using var stream = new MemoryStream();
        using (var plantilla = WordprocessingDocument.Open(plantillaPath, false))
        {
            plantilla.Clone(stream);
        }

        using (var docx = WordprocessingDocument.Open(stream, true))
        {
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

            docx.MainDocumentPart?.Document?.Save();
        }

        resultadoBytes = stream.ToArray();

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
