namespace Backend_CrmSG.DTOs
{
    public class SimulacionRequest
    {
        public decimal Capital { get; set; }
        public short Plazo { get; set; }
        public DateTime FechaInicial { get; set; }

        public decimal Tasa { get; set; }
        public decimal AporteAdicional { get; set; }

        public decimal CosteOperativo { get; set; } // Porcentaje o fijo
        public decimal CosteNotarizacion { get; set; }

        // Opcionales para lógica futura (pago de renta por período, tipos de cuenta, ISD, etc.)
        public string PeriodoPagoRenta { get; set; } = "F"; // "F" = Final, "P" = Por período, "N" = No aplica
        public string CuentaAporteInicial { get; set; } = "U"; // "E" = Ecuador, "U" = USA
        public string CuentaAporteAdicional { get; set; } = "U";
        public string CuentaAporteMensual { get; set; } = "U";

        public int IdOrigenCapital { get; set; } // Nuevo campo requerido
        public int Periodicidad { get; set; }    // Nuevo campo (se extrae de Producto)

        public decimal MontoISD { get; set; } = 0; // Por defecto sin límite

        public bool EsIncremento { get; set; } = false;  // valor por defecto false
    }
}
