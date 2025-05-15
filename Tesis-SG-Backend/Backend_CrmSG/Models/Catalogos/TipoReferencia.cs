// Models/Catalogos/TipoReferencia.cs
using System.ComponentModel.DataAnnotations;

namespace Backend_CrmSG.Models.Catalogos
{
    public class TipoReferencia
    {
        [Key]
        public int IdTipoReferencia { get; set; }
        public string? Nombre { get; set; }
    }
}
