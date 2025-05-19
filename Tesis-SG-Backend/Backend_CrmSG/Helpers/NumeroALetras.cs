namespace Backend_CrmSG.Helpers
{
    public static class NumeroALetras
    {
        public static string Convertir(decimal numero)
        {
            if (numero == 0)
                return "CERO";

            var entero = (long)Math.Truncate(numero);
            var decimales = (int)((numero - entero) * 100);

            var letrasEntero = ConvertirEntero(entero);
            var letrasDecimales = decimales > 0 ? $"CON {decimales:00}/100" : "";

            return $"{letrasEntero} {letrasDecimales}".Trim();
        }

        private static string ConvertirEntero(long numero)
        {
            if (numero == 0)
                return "";

            if (numero < 0)
                return "MENOS " + ConvertirEntero(Math.Abs(numero));

            string[] unidades = { "", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
                              "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE" };
            string[] decenas = { "", "", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA" };
            string[] centenas = { "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS",
                              "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS" };

            if (numero < 20)
                return unidades[numero];

            if (numero < 100)
            {
                if (numero % 10 == 0)
                    return decenas[numero / 10];
                if (numero < 30)
                    return "VEINTI" + unidades[numero % 10].ToLower();
                return decenas[numero / 10] + " Y " + unidades[numero % 10];
            }

            if (numero < 1000)
            {
                if (numero == 100)
                    return "CIEN";
                return centenas[numero / 100] + " " + ConvertirEntero(numero % 100);
            }

            if (numero < 1000000)
            {
                var miles = numero / 1000;
                var resto = numero % 1000;
                var milesTexto = miles == 1 ? "MIL" : ConvertirEntero(miles) + " MIL";
                return (milesTexto + " " + ConvertirEntero(resto)).Trim();
            }

            var millones = numero / 1000000;
            var restoMillones = numero % 1000000;
            var millonesTexto = millones == 1 ? "UN MILLÓN" : ConvertirEntero(millones) + " MILLONES";
            return (millonesTexto + " " + ConvertirEntero(restoMillones)).Trim();
        }
    }

}
