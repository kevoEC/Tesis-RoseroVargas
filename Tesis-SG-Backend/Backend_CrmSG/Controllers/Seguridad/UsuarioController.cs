using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Backend_CrmSG.Models.Seguridad;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.Services.Seguridad;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Backend_CrmSG.DTOs.Seguridad;
using Backend_CrmSG.Services.Correo;
using Backend_CrmSG.Services.SMS;

namespace Backend_CrmSG.Controllers.Seguridad
{
    /// <summary>
    /// Controlador para la gestión y autenticación de usuarios.
    /// Provee operaciones de login, validación, gestión de roles, menús y CRUD de usuario.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly StoredProcedureService _storedProcedureService;
        private readonly IJwtService _jwtService;
        private readonly ICorreoService _correoService;
        private readonly ISmsService _smsService;

        /// <summary>
        /// Constructor para inyección de dependencias.
        /// </summary>
        public UsuarioController(IUsuarioService usuarioService, IJwtService jwtService, StoredProcedureService storedProcedureService, ICorreoService correoService, ISmsService smsService)
        {
            _usuarioService = usuarioService;
            _storedProcedureService = storedProcedureService;
            _jwtService = jwtService;
            _correoService = correoService;
            _smsService = smsService;
        }

        /// <summary>
        /// Realiza el login del usuario y retorna un token JWT, datos del usuario, roles y permisos.
        /// </summary>
        /// <param name="loginRequest">Objeto con email y contraseña.</param>
        /// <returns>Token de autenticación y datos de usuario.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            var result = await _storedProcedureService.EjecutarLoginSP(loginRequest.Email, loginRequest.Contraseña);

            if (result.Usuario == null)
                return Unauthorized("Credenciales inválidas o usuario inactivo.");

            var claims = new List<Claim>
            {
                new Claim("idUsuario", result.Usuario.Id.ToString()),
                new Claim(ClaimTypes.Email, result.Usuario.Email),
                new Claim(JwtRegisteredClaimNames.Sub, result.Usuario.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            foreach (var rol in result.Roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, rol));
            }

            var token = _jwtService.GenerateTokenFromClaims(claims);
            var permisosAgrupados = result.Permisos
                .GroupBy(p => new { p.Menu, p.Nombre, p.Ruta, p.Icono })
                .Select(g => new
                {
                    Menu = g.Key.Menu,
                    Nombre = g.Key.Nombre,
                    Ruta = g.Key.Ruta,
                    Icono = g.Key.Icono,
                    Permisos = g.Select(p => p.Permiso).ToList()
                }).ToList();

            return Ok(new
            {
                Token = token,
                Usuario = new
                {
                    Id = result.Usuario.Id,
                    Nombre = result.Usuario.NombreCompleto,
                    Correo = result.Usuario.Email,
                    Identificacion = result.Usuario.Identificacion
                },
                Roles = result.Roles,
                Permisos = permisosAgrupados
            });
        }

        /// <summary>
        /// Obtiene los roles asignados a un usuario específico.
        /// </summary>
        /// <param name="idUsuario">Id del usuario.</param>
        [HttpGet("roles/{idUsuario}")]
        public async Task<IActionResult> GetRoles(int idUsuario)
        {
            var roles = await _usuarioService.GetRolesByUserIdAsync(idUsuario);
            return Ok(roles);
        }

        /// <summary>
        /// Obtiene los menús permitidos para un usuario según sus roles y permisos.
        /// </summary>
        /// <param name="idUsuario">Id del usuario.</param>
        [HttpGet("menus/{idUsuario}")]
        public async Task<IActionResult> GetMenus(int idUsuario)
        {
            var menus = await _usuarioService.GetMenusByUserIdAsync(idUsuario);
            return Ok(menus);
        }

        /// <summary>
        /// Obtiene todos los usuarios registrados.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _usuarioService.GetAllAsync();
            return Ok(usuarios);
        }

        /// <summary>
        /// Obtiene la información de un usuario específico.
        /// </summary>
        /// <param name="id">Id del usuario.</param>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var usuario = await _usuarioService.GetByIdAsync(id);
            if (usuario == null) return NotFound();
            return Ok(usuario);
        }

        /// <summary>
        /// Crea un nuevo usuario (registro manual/administrativo).
        /// </summary>
        /// <param name="usuario">Objeto usuario a registrar.</param>
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Usuario usuario)
        {
            await _usuarioService.AddAsync(usuario);
            return CreatedAtAction(nameof(GetById), new { id = usuario.IdUsuario }, usuario);
        }

        /// <summary>
        /// Actualiza los datos de un usuario existente.
        /// </summary>
        /// <param name="id">Id del usuario a actualizar.</param>
        /// <param name="usuario">Objeto usuario con datos nuevos.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] Usuario usuario)
        {
            if (id != usuario.IdUsuario)
                return BadRequest("El ID no coincide.");

            await _usuarioService.UpdateAsync(usuario);
            return NoContent();
        }

        /// <summary>
        /// Elimina un usuario por su identificador.
        /// </summary>
        /// <param name="id">Id del usuario a eliminar.</param>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _usuarioService.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Realiza el registro parcial de un usuario y envía correo de validación.
        /// </summary>
        /// <param name="dto">DTO con los datos mínimos de registro.</param>
        [HttpPost("registro-parcial")]
        public async Task<IActionResult> RegistroParcial([FromBody] RegistroParcialDTO dto)
        {
            try
            {
                var usuarioExistente = await _usuarioService.ObtenerPorEmailOIdentificacion(dto.Email, dto.Identificacion);
                if (usuarioExistente != null)
                {
                    return Conflict(new
                    {
                        success = false,
                        message = "El correo o la identificación ya están registrados."
                    });
                }

                var resultado = await _storedProcedureService.EjecutarSpRegistrarUsuarioParcial(dto);

                if (resultado == null)
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Error al registrar el usuario parcial."
                    });
                }

                // Enviar correo de validación (manejo de error incluido)
                var correoEnviado = false;
                try
                {
                    correoEnviado = await _correoService.EnviarCorreoValidacion(resultado.Email, resultado.HashValidacion);
                }
                catch (Exception ex)
                {
                    // Logging si falla el envío
                    Console.WriteLine($"Error al enviar correo: {ex.Message}");
                }

                return Ok(new
                {
                    success = true,
                    usuarioCreado = true,
                    correoEnviado,
                    idUsuario = resultado.IdUsuario,
                    message = correoEnviado
                        ? "Usuario registrado y correo de validación enviado."
                        : "Usuario registrado. No se pudo enviar el correo de validación."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrió un error inesperado.",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Valida el correo electrónico de un usuario a través del token recibido por email.
        /// </summary>
        /// <param name="token">Token de validación de correo.</param>
        [HttpGet("validar-correo")]
        public async Task<IActionResult> ValidarCorreo([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Token no proporcionado."
                });
            }

            var resultado = await _usuarioService.ValidarCorreoPorHashAsync(token);

            if (!resultado.Exitoso)
            {
                return BadRequest(new
                {
                    success = false,
                    message = resultado.Mensaje
                });
            }

            return Ok(new
            {
                success = true,
                yaValidado = resultado.YaValidado,
                message = resultado.Mensaje
            });
        }

        /// <summary>
        /// Envía un código SMS al número del usuario para validación de teléfono.
        /// </summary>
        /// <param name="dto">DTO con idUsuario, número y extensión internacional.</param>
        [HttpPost("enviar-codigo-telefono")]
        public async Task<IActionResult> EnviarCodigoTelefono([FromBody] SolicitudCodigoTelefonoDTO dto)
        {
            var resultado = await _usuarioService.EnviarCodigoSmsValidacion(
                dto.IdUsuario,
                dto.Numero,
                dto.Extension,
                async (numeroCompleto, mensaje) => await _smsService.EnviarCodigoValidacion(numeroCompleto, mensaje)
            );

            if (!resultado.Success)
            {
                return BadRequest(new
                {
                    success = false,
                    message = resultado.Message
                });
            }

            return Ok(new
            {
                success = true,
                yaValidado = resultado.YaValidado,
                message = resultado.Message
            });
        }

        /// <summary>
        /// Valida el código SMS ingresado por el usuario para activar su teléfono.
        /// </summary>
        /// <param name="dto">DTO con idUsuario y código ingresado.</param>
        [HttpPost("validar-telefono")]
        public async Task<IActionResult> ValidarTelefono([FromBody] ValidacionTelefonoDTO dto)
        {
            var resultado = await _usuarioService.ValidarCodigoTelefonoAsync(dto.IdUsuario, dto.Codigo);

            if (!resultado.Exitoso)
            {
                return BadRequest(new { success = false, message = resultado.Mensaje });
            }

            return Ok(new
            {
                success = true,
                yaValidado = resultado.YaValidado,
                message = resultado.Mensaje
            });
        }
    }
}
