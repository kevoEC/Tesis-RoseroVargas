using System.Globalization;
using System.Text.Json;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Backend_CrmSG.Data;
using Backend_CrmSG.Models.Entidades;
using Microsoft.EntityFrameworkCore;
using DocumentFormat.OpenXml;
using Backend_CrmSG.Models.Documentos;

public class GeneradorAnexoService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public GeneradorAnexoService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    public async Task<bool> GenerarAnexoDesdeSolicitudAsync(int idSolicitudInversion)
    {
        // Obtener datos principales
        var solicitud = await _context.SolicitudesInversionDetalle
            .FirstOrDefaultAsync(s => s.IdSolicitudInversion == idSolicitudInversion)
            ?? throw new Exception("Solicitud no encontrada");

        var proyeccion = await _context.Proyeccion
            .FirstOrDefaultAsync(p => p.IdProyeccion == solicitud.IdProyeccionSeleccionada)
            ?? throw new Exception("Proyección no encontrada");

        var cronograma = await _context.CronogramaProyeccion
            .FirstOrDefaultAsync(c => c.IdProyeccion == proyeccion.IdProyeccion)
            ?? throw new Exception("Cronograma no encontrado");

        var documento = await _context.Documento
            .FirstOrDefaultAsync(d => d.IdSolicitudInversion == idSolicitudInversion && d.IdTipoDocumento == 11);

        if (documento == null)
        {
            documento = new Documento
            {
                IdSolicitudInversion = idSolicitudInversion,
                IdTipoDocumento = 11,
                FechaCreacion = DateTime.Now
            };
            _context.Documento.Add(documento);
        }

        string nombreCompleto = $"{solicitud.ApellidoPaterno} {solicitud.ApellidoMaterno} {solicitud.Nombres}".Trim().ToUpper();

        // Reemplazos simples
        var reemplazos = new Dictionary<string, string>
        {
            ["nombreCompleto"] = nombreCompleto,
            ["email"] = solicitud.CorreoElectronico ?? "",
            ["celular"] = solicitud.TelefonoCelular ?? "",
            ["capitalInicial"] = proyeccion.Capital.ToString("N2"),
            ["plazo"] = proyeccion.Plazo.ToString(),
            ["tasa"] = proyeccion.Tasa.ToString("N2"),
            ["costoOperativo"] = proyeccion.CosteOperativo?.ToString("N2") ?? "0.00",
            ["costoOperativo"] = proyeccion.CosteOperativo?.ToString("N2") ?? "0.00",
            ["liquidar"] = proyeccion.ValorProyectadoLiquidar?.ToString("N2") ?? "0.00",
            ["rentot"] = proyeccion.TotalRentabilidad?.ToString("N2") ?? "0.00",
            ["cotot"] = proyeccion.TotalCosteOperativo?.ToString("N2") ?? "0.00",
            ["rmtot"] = proyeccion.TotalRentaPeriodo?.ToString("N2") ?? "0.00",
            // Firma anexo apoderado
            ["nombreApoderado"] = "ANA GABRIELA SUASTI OÑA",
            ["tipoDocApoderado"] = "CI",
            ["numDocApoderado"] = "1722738190",
            ["textoApoderado2"] = "APODERADA ESPECIAL",
            ["nombreCompleto2"] = nombreCompleto,
            ["tipoDocu2"] = solicitud.NombreTipoDocumento ?? "",
            ["numeroDocu2"] = solicitud.NumeroDocumento ?? ""
        };

        var periodos = JsonSerializer.Deserialize<List<CronogramaPeriodo>>(cronograma.PeriodosJson)
            ?? throw new Exception("Error al parsear JSON del cronograma");

        // --- SEGMENTACIÓN POR PLANTILLA SEGÚN PRODUCTO ---
        string plantillaPath;

        if (proyeccion.IdProducto == 1)
        {
            plantillaPath = Path.Combine(_env.ContentRootPath, "Plantillas", "PlantillaAnexoProyeccionRentaFija.docx");
        }
        else
        {
            plantillaPath = Path.Combine(_env.ContentRootPath, "Plantillas", "PlantillaAnexoProyeccionRentaPeriodica.docx");
        }

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
                var body = docx.MainDocumentPart?.Document?.Body ?? throw new Exception("Documento sin contenido principal");

                // Reemplazo simple
                var tags = docx.MainDocumentPart?.Document?.Descendants<SdtElement>();
                foreach (var sdt in tags!)
                {
                    var tag = sdt.SdtProperties?.GetFirstChild<Tag>()?.Val?.Value;
                    if (!string.IsNullOrWhiteSpace(tag) && reemplazos.TryGetValue(tag, out var valor))
                    {
                        var texto = sdt.Descendants<Text>().FirstOrDefault();
                        if (texto != null)
                            texto.Text = valor;
                    }
                }

                // Reemplazo de tabla de periodos
                var tabla = docx.MainDocumentPart?.Document?.Descendants<Table>().FirstOrDefault();
                var filaPlantilla = tabla?.Descendants<TableRow>().Skip(1).FirstOrDefault();

                if (tabla != null && filaPlantilla != null)
                {
                    foreach (var periodo in periodos)
                    {
                        var nuevaFila = (TableRow)filaPlantilla.CloneNode(true);

                        ReplaceCellText(nuevaFila, "per", periodo.Periodo.ToString());
                        ReplaceCellText(nuevaFila, "ini", periodo.FechaInicial.ToString("yyyy-MM-dd"));
                        ReplaceCellText(nuevaFila, "fin", periodo.FechaVencimiento.ToString("yyyy-MM-dd"));
                        ReplaceCellText(nuevaFila, "tas", periodo.Tasa.ToString("N2"));
                        ReplaceCellText(nuevaFila, "cap", periodo.Capital.ToString("N2"));
                        ReplaceCellText(nuevaFila, "ren", periodo.Rentabilidad.ToString("N2"));
                        ReplaceCellText(nuevaFila, "co", periodo.CostoOperativo.ToString("N2"));
                        ReplaceCellText(nuevaFila, "ra", periodo.RentaAcumulada.ToString("N2"));
                        ReplaceCellText(nuevaFila, "cr", periodo.CapitalRenta.ToString("N2"));
                        ReplaceCellText(nuevaFila, "ic", periodo.CapitalFinal.ToString("N2"));
                        ReplaceCellText(nuevaFila, "rm", periodo.RentaPeriodo.ToString("N2"));

                        tabla.AppendChild(nuevaFila);
                    }

                    filaPlantilla.Remove(); // Eliminar fila original
                }

                docx.MainDocumentPart?.Document?.Save();
                resultadoBytes = plantillaStream.ToArray();
            }
        }

        documento.Archivo = resultadoBytes;
        _context.Update(documento);
        await _context.SaveChangesAsync();
        return true;
    }

    private void ReplaceCellText(TableRow row, string tag, string value)
    {
        var cell = row.Descendants<SdtElement>()
            .FirstOrDefault(e => e.SdtProperties?.GetFirstChild<Tag>()?.Val?.Value == tag);
        var text = cell?.Descendants<Text>().FirstOrDefault();
        if (text != null)
            text.Text = value;
    }

    private class CronogramaPeriodo
    {
        public int Periodo { get; set; }
        public DateTime FechaInicial { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public decimal Tasa { get; set; }
        public decimal Capital { get; set; }
        public decimal Rentabilidad { get; set; }
        public decimal CostoOperativo { get; set; }
        public decimal RentaAcumulada { get; set; }
        public decimal CapitalRenta { get; set; }
        public decimal CapitalFinal { get; set; }
        public decimal RentaPeriodo { get; set; }
    }
}
