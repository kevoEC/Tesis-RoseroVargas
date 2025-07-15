using Microsoft.EntityFrameworkCore;
using Backend_CrmSG.Data;
using Backend_CrmSG.Repositories;
using Backend_CrmSG.Services;
using Backend_CrmSG.Services.Seguridad;
using Backend_CrmSG.Middleware;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Backend_CrmSG.Services.Producto;
using Backend_CrmSG.Services.Validaciones;
using Backend_CrmSG.Services.Documento;
using Backend_CrmSG.Services.Correo;
using Backend_CrmSG.Services.SMS;
using Backend_CrmSG.Services.Entidad;
using Backend_CrmSG.Services.Entidad.Inversion;
using Backend_CrmSG.Services.Entidad.Caso;
using Backend_CrmSG.Services.Entidad.Pago;
using Backend_CrmSG.Services.Dashboard.Prospecto;
using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using Backend_CrmSG.Services.Entidad.Adendum;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Falta Jwt:Key en appsettings.json");

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Falta Jwt:Issuer en appsettings.json");

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("Falta Jwt:Audience en appsettings.json");


// ------------------------- Configuración de Azure AD -------------------------
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
            "http://localhost:5174",   // Segundo frontend o entorno paralelo
            "http://localhost:5175",   // Segundo frontend o entorno paralelo
            "http://localhost:5176"   // Segundo frontend o entorno paralelo
        )
        .AllowAnyHeader()
        .AllowAnyMethod());
});



// ------------------- JWT SERVICE LOCAL ---------------------------
builder.Services.AddScoped<IJwtService, JwtService>();

// ------------- AUTENTICACIÓN MÚLTIPLE ----------------------------
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
            if (token.Length > 1000) // Tokens de Microsoft suelen ser más largos
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

// ------------------ AUTORIZACIÓN GENERAL --------------------------
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
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SG CONSULTING API",
        Version = "v1",
        Description = "API oficial de SG Consulting Group para gestión de CRM, inversiones y catálogos.",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "Equipo de Tecnología SG",
            Email = "soporte@sgconsulting.site",
            Url = new Uri("https://sgconsulting.site")
        },
        License = new Microsoft.OpenApi.Models.OpenApiLicense
        {
            Name = "Licencia Interna SG",
            Url = new Uri("https://sgconsulting.site/licencia")
        }
    });

    // 🔽 Agrega esto para que Swagger lea los comentarios XML de tus controladores
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});



// ------------------ INYECCIÓN DE SERVICIOS ------------------------
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<StoredProcedureService>();
builder.Services.AddScoped<ProyeccionService>();
builder.Services.AddScoped<SimuladorProyeccionService>();
builder.Services.AddHttpClient<IValidacionService, ValidacionService>();
builder.Services.AddScoped<IDocumentoService, DocumentoService>();
builder.Services.AddScoped<ICorreoService, CorreoService>();
builder.Services.AddScoped<ISmsService, TwilioSmsService>();
builder.Services.AddScoped<ITareaService, TareaService>();
builder.Services.AddScoped<GeneradorContratoService>();
builder.Services.AddScoped<GeneradorAnexoService>();
builder.Services.AddScoped<IClienteService, ClienteService>();
builder.Services.AddScoped<IInversionService, InversionService>();
builder.Services.AddScoped<ICasoService, CasoService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<ContratoSecuencialService>();
builder.Services.AddScoped<IAdendumService, AdendumService>();

// Catálogos
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IConfiguracionProductoService, ConfiguracionProductoService>();


// Seguridad
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IUsuarioRolService, UsuarioRolService>();
builder.Services.AddScoped<EnsureMicrosoftUserExistsAttribute>();

//Dashboard

builder.Services.AddScoped<DashboardProspectoService>();
builder.Services.AddScoped<DashboardSolicitudService>();
builder.Services.AddScoped<DashboardTareasService>();
builder.Services.AddScoped<DashboardClienteService>();
builder.Services.AddScoped<DashboardInversionService>();
builder.Services.AddScoped<DashboardPagosCasosService>();



builder.WebHost.UseUrls("http://+:8080", "https://+:443");
// ------------------ APP BUILD --------------------------------------
var app = builder.Build();

if (app.Environment.IsDevelopment() || app.Environment.IsEnvironment("QA") || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SG CONSULTING API v1");
        c.RoutePrefix = "swagger"; // Accedes desde http://localhost:8080/swagger
    });
}


app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
