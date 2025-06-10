namespace Backend_CrmSG.DTOs.Pago
{
    public class PagoCreateDTO
    {
        public int IdCalendario { get; set; }
        public int CantidadPagos { get; set; }
        public bool DescartarPagos { get; set; }
        public bool GenerarPagos { get; set; }
        public string Detalle { get; set; } = string.Empty;
        public bool ConfirmarRegistrosPagos { get; set; }
        public int IdUsuarioCreacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
    }

}
