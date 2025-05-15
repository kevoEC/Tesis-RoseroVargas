using Backend_CrmSG.DTOs;
using System.Net.Http;
using System.Text;
using System.Text.Json;

namespace Backend_CrmSG.Services.Validaciones
{
    public class ValidacionService : IValidacionService
    {
        private readonly HttpClient _http;

        public ValidacionService(HttpClient http)
        {
            _http = http;
        }

        public async Task<EquifaxResponseDto?> ValidarEquifaxAsync(EquifaxRequestDto dto)
        {
            var url = "https://ascrmsg.azurewebsites.net/validacion/equifax";

            _http.DefaultRequestHeaders.Clear();
            _http.DefaultRequestHeaders.Add("x-api-key", "NSFPG2H3s6k+D8R0/fNYMU6wJABda67Z");
            _http.DefaultRequestHeaders.Add("Accept", "application/json");

            var content = new StringContent(
                JsonSerializer.Serialize(dto),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _http.PostAsync(url, content);

            if (response.IsSuccessStatusCode)
            {
                var responseBody = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<EquifaxResponseDto>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }

            return null;
        }

        public async Task<LdsResponseDto?> ValidarLdsAsync(LdsRequestDto dto)
        {
            var url = "https://ascrmsgdes.azurewebsites.net/validacion/lds";

            var content = new StringContent(
                JsonSerializer.Serialize(dto),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _http.PostAsync(url, content);
            if (!response.IsSuccessStatusCode) return null;

            var raw = await response.Content.ReadAsStringAsync();

            var data = JsonSerializer.Deserialize<LdsResponseDto>(raw, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return data;
        }

    }
}
