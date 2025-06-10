namespace Backend_CrmSG.DTOs.Pago
{
    public class PagoUpdateDTO
    {
        public int CantidadPagos { get; set; }
        public bool DescartarPagos { get; set; }
        public bool GenerarPagos { get; set; }
        public string Detalle { get; set; } = string.Empty;
        public bool ConfirmarRegistrosPagos { get; set; }
        public int IdUsuarioModificacion { get; set; }
        public int IdUsuarioPropietario { get; set; }
    }

}
