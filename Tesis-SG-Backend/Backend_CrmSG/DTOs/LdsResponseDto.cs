namespace Backend_CrmSG.DTOs
{
    public class LdsResponseDto
    {
        public int score { get; set; }
        public bool error { get; set; }
        public string? mensaje { get; set; }
        public List<LdsResultadoItem>? resultados { get; set; }
        public bool coincidencia { get; set; }
        public int observacion { get; set; }
        public DateTime? fechaResultado { get; set; }
        public string? tipoLista { get; set; }
    }

    public class LdsResultadoItem
    {
        public int score { get; set; }
        public string? identificacion { get; set; }
        public string? nombreCompleto { get; set; }
        public string? tipoCoincidencia { get; set; }
        public string? nombreLista { get; set; }
        public DateTime? fechaLista { get; set; }
        public string? observacion { get; set; }
        public List<string>? aproximaciones { get; set; }
    }
}
