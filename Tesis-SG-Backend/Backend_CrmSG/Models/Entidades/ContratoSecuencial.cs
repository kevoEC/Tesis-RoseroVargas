using System;
using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Entidades
{
    public class ContratoSecuencial
    {
        [Key]
        public int IdContratoSecuencial { get; set; }

        public int IdSolicitudInversion { get; set; }
        public int IdProyeccion { get; set; }
        public string NumeroContrato { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
    }
}
