using Microsoft.EntityFrameworkCore;
using Backend_CrmSG.Data;
using Backend_CrmSG.Repositories;
using Backend_CrmSG.Services;
using TesisBackend.Services;
using Backend_CrmSG.Services.Catalogos;
using Backend_CrmSG.Services.Seguridad;
using Backend_CrmSG.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend_CrmSG.Services.Producto;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Falta Jwt:Key en appsettings.json");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Falta Jwt:Issuer en appsettings.json");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("Falta Jwt:Audience en appsettings.json");


// ------------------------- Configuraci�n de Azure AD -------------------------
var azureAd = builder.Configuration.GetSection("AzureAd");
var azureInstance = azureAd["Instance"]
    ?? throw new InvalidOperationException("Falta AzureAd:Instance");

var azureTenantId = azureAd["TenantId"]
    ?? throw new InvalidOperationException("Falta AzureAd:TenantId");

var azureAudience = azureAd["Audience"]
    ?? throw new InvalidOperationException("Falta AzureAd:Audience");

var azureAuthority = $"{azureInstance}{azureTenantId}/v2.0";
var azureIssuer = $"https://sts.windows.net/{azureTenantId}/";


// ------------------------- CORS ----------------------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy => policy
        .WithOrigins(
            "http://localhost:5173",  // Vite frontend original
            "http://localhost:5174"   // Segundo frontend o entorno paralelo
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});

// ------------------- JWT SERVICE LOCAL ---------------------------
builder.Services.AddScoped<IJwtService, JwtService>();

// ------------- AUTENTICACI�N M�LTIPLE ----------------------------
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "MultiAuthScheme";
})
.AddPolicyScheme("MultiAuthScheme", "JWT or Azure AD", options =>
{
    options.ForwardDefaultSelector = context =>
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader.Substring("Bearer ".Length);
            if (token.Length > 1000) // Tokens de Microsoft suelen ser m�s largos
                return "AzureAdJwtScheme";
            else
                return "LocalJwtScheme";
        }
        return "LocalJwtScheme";
    };
})
.AddJwtBearer("LocalJwtScheme", options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
})
.AddJwtBearer("AzureAdJwtScheme", options =>
{
    options.Authority = azureAuthority;
    options.Audience = azureAudience;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = azureIssuer,
        ValidateAudience = true,
        ValidAudience = azureAudience,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
});

// ------------------ AUTORIZACI�N GENERAL --------------------------
builder.Services.AddAuthorization();

// ------------------ DB CONTEXT ------------------------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ------------------ CONTROLADORES ---------------------------------
builder.Services.AddControllers(options =>
{
    options.Filters.Add<Backend_CrmSG.Filters.SuccessMessageFilter>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ------------------ INYECCI�N DE SERVICIOS ------------------------
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IProspectoService, ProspectoService>();
builder.Services.AddScoped<IActividadService, ActividadService>();
builder.Services.AddScoped<ISolicitudInversionService, SolicitudInversionService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<StoredProcedureService>();
builder.Services.AddScoped<ProyeccionService>();
builder.Services.AddScoped<SimuladorProyeccionService>();
builder.Services.AddHttpClient<IValidacionService, ValidacionService>();





// Cat�logos
builder.Services.AddScoped<IOrigenClienteService, OrigenClienteService>();
builder.Services.AddScoped<IAgenciaService, AgenciaService>();
builder.Services.AddScoped<IPrioridadService, PrioridadService>();
builder.Services.AddScoped<ITipoActividadService, TipoActividadService>();
builder.Services.AddScoped<ITipoIdentificacionService, TipoIdentificacionService>();
builder.Services.AddScoped<IProductoInteresService, ProductoInteresService>();
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IConfiguracionProductoService, ConfiguracionProductoService>();


// Seguridad
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IRolService, RolService>();
builder.Services.AddScoped<IPermisoService, PermisoService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IUsuarioRolService, UsuarioRolService>();
builder.Services.AddScoped<EnsureMicrosoftUserExistsAttribute>();


// ------------------ APP BUILD --------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
