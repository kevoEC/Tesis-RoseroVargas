using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend_CrmSG.DTOs;
using Backend_CrmSG.DTOs.SolicitudDTOs;
using Backend_CrmSG.Models.Seguridad;
using Backend_CrmSG.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Backend_CrmSG.Services.Seguridad
{
    public class UsuarioService : IUsuarioService
    {
        private readonly IRepository<Usuario> _usuarioRepository;
        private readonly IRepository<TransaccionesValidacion> _transaccionRepository;
        private readonly IRepository<TipoTransaccion> _tipoTransaccionRepository;
        // Si en el futuro necesitas acceder a UsuarioRol, Rol, Permiso, Menu, etc., 
        // puedes inyectar sus respectivos repositorios aquí.
        // private readonly IRepository<UsuarioRol> _usuarioRolRepository;
        // private readonly IRepository<Rol> _rolRepository;
        // private readonly IRepository<Permiso> _permisoRepository;
        // private readonly IRepository<Menu> _menuRepository;

        public UsuarioService(
            IRepository<Usuario> usuarioRepository,
            IRepository<TransaccionesValidacion> transaccionRepository,
            IRepository<TipoTransaccion> tipoTransaccionRepository)
        {
            _usuarioRepository = usuarioRepository;
            _transaccionRepository = transaccionRepository;
            _tipoTransaccionRepository = tipoTransaccionRepository;
        }

        // ========== Autenticación ==========
        public async Task<Usuario?> AuthenticateAsync(string email, string password)
        {
            var user = await _usuarioRepository
                .GetAllAsync()
                .ContinueWith(t => t.Result.FirstOrDefault(u =>
                     u.Email == email && u.Contraseña == password && u.EsActivo == true));

            return user;
        }


        // ========== Roles ==========
        public async Task<IEnumerable<string>> GetRolesByUserIdAsync(int idUsuario)
        {
            // Aquí deberías consultar la tabla UsuarioRol para obtener los roles asignados al usuario
            // y luego obtener el nombre de cada rol. Por simplicidad, se retorna un listado mock.
            return await Task.FromResult(new List<string> { "Admin", "Vendedor" });
        }

        // ========== Menús según roles ==========
        public async Task<IEnumerable<object>> GetMenusByUserIdAsync(int idUsuario)
        {
            // 1) Obtener los roles del usuario
            var roles = await GetRolesByUserIdAsync(idUsuario);
            // 2) Con la lista de roles, deberías consultar las tablas correspondientes (Permiso, Menu, etc.)
            // para obtener los menús permitidos. Aquí se retorna una lista ficticia.
            var menus = new List<object>
            {
                new { IdMenu = 1, Nombre = "Dashboard", Url = "/dashboard" },
                new { IdMenu = 2, Nombre = "Ventas", Url = "/ventas" }
            };

            return menus;
        }

        // ========== CRUD Básico ==========
        public async Task<IEnumerable<Usuario>> GetAllAsync()
        {
            return await _usuarioRepository.GetAllAsync();
        }

        public async Task<Usuario> GetByIdAsync(int id)
        {
            return await _usuarioRepository.GetByIdAsync(id);
        }

        public async Task AddAsync(Usuario usuario)
        {
            // Aquí podrías incluir la lógica para encriptar la contraseña y validar datos.
            await _usuarioRepository.AddAsync(usuario);
        }

        public async Task UpdateAsync(Usuario usuario)
        {
            // Aquí podrías incluir validaciones adicionales y actualizar la fecha de modificación.
            await _usuarioRepository.UpdateAsync(usuario);
        }

        public async Task DeleteAsync(int id)
        {
            await _usuarioRepository.DeleteAsync(id);
        }

        public async Task<Usuario?> BuscarPorCorreoAsync(string email)
        {
            return await _usuarioRepository
                .GetAllAsync()
                .ContinueWith(t => t.Result.FirstOrDefault(u => u.Email == email));
        }

        public async Task<int> InsertarUsuarioParcialAsync(Usuario usuario)
        {
            await _usuarioRepository.AddAsync(usuario);
            return usuario.IdUsuario; // Retorna el ID generado
        }

        public async Task<Usuario?> ObtenerPorEmailOIdentificacion(string email, string identificacion)
        {
            var usuarios = await _usuarioRepository.GetAllAsync();
            return usuarios.FirstOrDefault(u =>
                u.Email == email || u.Identificacion == identificacion);
        }


        public async Task RegistrarTransaccionValidacionCorreo(int idUsuario, string email)
        {
            var tipos = await _tipoTransaccionRepository.GetAllAsync();
            var tipoCorreo = tipos.FirstOrDefault(t => t.Nombre == "Correo");

            if (tipoCorreo == null)
                throw new Exception("No se encontró el tipo de transacción 'Correo'.");

            var hash = GenerarHash(email + DateTime.UtcNow.ToString("yyyyMMddHHmmss"));

            var transaccion = new TransaccionesValidacion
            {
                IdUsuario = idUsuario,
                IdTipoTransaccion = tipoCorreo.IdTipoTransaccion,
                HashValidacion = hash,
                FechaCreacion = DateTime.UtcNow,
                Expiracion = DateTime.UtcNow.AddMinutes(30),
                Operacion = "Creacion",
                Exitoso = false
            };

            await _transaccionRepository.AddAsync(transaccion);

            // Aquí podrías enviar un correo con el link de validación que incluya el hash.
        }

        private string GenerarHash(string input)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(input);
                var hashBytes = sha256.ComputeHash(bytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }

        public async Task<ResultadoValidacionCorreo> ValidarCorreoPorHashAsync(string hash)
        {
            var transacciones = await _transaccionRepository.GetAllAsync();
            var tipoTransacciones = await _tipoTransaccionRepository.GetAllAsync();

            var tipoCorreo = tipoTransacciones.FirstOrDefault(t => t.Nombre == "Correo");
            if (tipoCorreo == null)
                return new ResultadoValidacionCorreo { Exitoso = false, Mensaje = "Tipo de transacción no válido." };

            var transaccion = transacciones.FirstOrDefault(t => t.HashValidacion == hash && t.IdTipoTransaccion == tipoCorreo.IdTipoTransaccion);

            if (transaccion == null)
                return new ResultadoValidacionCorreo { Exitoso = false, Mensaje = "Token inválido." };

            if (transaccion.Exitoso)
            {
                return new ResultadoValidacionCorreo
                {
                    Exitoso = true,
                    YaValidado = true,
                    Mensaje = "Tu cuenta ya había sido validada anteriormente."
                };
            }

            if (transaccion.Expiracion < DateTime.UtcNow)
            {
                return new ResultadoValidacionCorreo
                {
                    Exitoso = false,
                    Mensaje = "El enlace ha expirado."
                };
            }

            var usuario = await _usuarioRepository.GetByIdAsync(transaccion.IdUsuario);
            if (usuario == null)
                return new ResultadoValidacionCorreo { Exitoso = false, Mensaje = "Usuario no encontrado." };

            usuario.ValidacionCorreo = true;
            usuario.EsActivo = true;
            usuario.FechaModificacion = DateTime.UtcNow;
            transaccion.Exitoso = true;

            await _usuarioRepository.UpdateAsync(usuario);
            await _transaccionRepository.UpdateAsync(transaccion);

            return new ResultadoValidacionCorreo
            {
                Exitoso = true,
                YaValidado = false,
                Mensaje = "Correo validado exitosamente. Tu cuenta ya está activa."
            };
        }


        public async Task<ResultadoEnvioSms> EnviarCodigoSmsValidacion(
            int idUsuario,
            string telefono,
            string extension,
            Func<string, string, Task<bool>> sendSms)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(idUsuario);
            if (usuario == null)
                return new ResultadoEnvioSms { Success = false, Message = "Usuario no encontrado." };

            if (usuario.ValidacionTelefono)
            {
                return new ResultadoEnvioSms
                {
                    Success = true,
                    YaValidado = true,
                    Message = "Este número ya fue validado anteriormente."
                };
            }

            var numeroCompleto = extension + telefono;
            usuario.Telefono = numeroCompleto;
            usuario.FechaModificacion = DateTime.UtcNow;

            await _usuarioRepository.UpdateAsync(usuario);

            var tipos = await _tipoTransaccionRepository.GetAllAsync();
            var tipoTelefono = tipos.FirstOrDefault(t => t.Nombre == "Telefono");
            if (tipoTelefono == null)
                return new ResultadoEnvioSms { Success = false, Message = "Tipo de transacción no encontrado." };

            var codigo = new Random().Next(100000, 999999).ToString();

            var transaccion = new TransaccionesValidacion
            {
                IdUsuario = idUsuario,
                IdTipoTransaccion = tipoTelefono.IdTipoTransaccion,
                HashValidacion = codigo,
                FechaCreacion = DateTime.UtcNow,
                Expiracion = DateTime.UtcNow.AddMinutes(10),
                Operacion = "ValidacionTelefono",
                Exitoso = false
            };

            await _transaccionRepository.AddAsync(transaccion);

            var mensaje = $"SG Consulting Group: Tu código de validación es {codigo}. No lo compartas con nadie. Válido por 10 minutos.";

            var enviado = await sendSms(numeroCompleto, mensaje);
            if (!enviado)
            {
                return new ResultadoEnvioSms { Success = false, Message = "No se pudo enviar el SMS de validación." };
            }

            return new ResultadoEnvioSms { Success = true, YaValidado = false, Message = "Código de validación enviado por SMS." };
        }


        public async Task<ResultadoValidacionTelefono> ValidarCodigoTelefonoAsync(int idUsuario, string codigo)
        {
            var usuario = await _usuarioRepository.GetByIdAsync(idUsuario);
            if (usuario == null)
            {
                return new ResultadoValidacionTelefono
                {
                    Exitoso = false,
                    Mensaje = "Usuario no encontrado."
                };
            }

            if (usuario.ValidacionTelefono)
            {
                return new ResultadoValidacionTelefono
                {
                    Exitoso = true,
                    YaValidado = true,
                    Mensaje = "Este número ya fue validado anteriormente."
                };
            }

            var transacciones = await _transaccionRepository.GetAllAsync();
            var tipos = await _tipoTransaccionRepository.GetAllAsync();

            var tipoTelefono = tipos.FirstOrDefault(t => t.Nombre == "Telefono");
            if (tipoTelefono == null)
                return new ResultadoValidacionTelefono { Exitoso = false, Mensaje = "Tipo no válido." };

            var transaccion = transacciones.FirstOrDefault(t =>
                t.IdUsuario == idUsuario &&
                t.HashValidacion == codigo &&
                t.IdTipoTransaccion == tipoTelefono.IdTipoTransaccion &&
                !t.Exitoso &&
                t.Expiracion > DateTime.UtcNow);

            if (transaccion == null)
            {
                return new ResultadoValidacionTelefono
                {
                    Exitoso = false,
                    Mensaje = "Código inválido o expirado."
                };
            }

            usuario.ValidacionTelefono = true;
            usuario.FechaModificacion = DateTime.UtcNow;
            transaccion.Exitoso = true;

            await _usuarioRepository.UpdateAsync(usuario);
            await _transaccionRepository.UpdateAsync(transaccion);

            return new ResultadoValidacionTelefono
            {
                Exitoso = true,
                YaValidado = false,
                Mensaje = "Número validado exitosamente."
            };
        }

    }
}
