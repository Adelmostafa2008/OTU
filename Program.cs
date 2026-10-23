using System.Text;
using System.Text.Unicode;
using backend.data;
using backend.Models;
using backend.Repos;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Tokens.Experimental;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDb>(options =>
{
    var connStr = builder.Configuration.GetConnectionString("connStr");

    options.UseMySql(
        connStr,
        ServerVersion.AutoDetect(connStr));
});

builder.Services.AddScoped<ITokenGen , TokenGen>();
builder.Services.AddScoped(typeof(IGenericRepo<>) , typeof(GenericRepo<>));
builder.Services.AddScoped<IUserRepo , UserRepo>();
builder.Services.AddScoped<ILessonRepo , LessonRepo>();
builder.Services.AddScoped<IQuizzesRepo , QuizzesRepo>();
builder.Services.AddScoped<IOnlineMeetRepo , OnlineMeetRepo>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();

builder.Services.AddIdentity<User, IdentityRole>(op =>
{
    op.Password.RequireDigit = true;
    op.Password.RequireUppercase = true;
    op.Password.RequireLowercase = true;
    op.Password.RequiredUniqueChars = 1;
    op.Password.RequiredLength = 8;
    
}).AddEntityFrameworkStores<AppDb>();



builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme =
    opt.DefaultChallengeScheme =
    opt.DefaultForbidScheme =
    opt.DefaultScheme =
    opt.DefaultSignInScheme =
    opt.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(opt =>
{
    opt.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        //"http://localhost:5226"
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(builder.Configuration["JWT:SigningKey"]!)
        )
    };
});

builder.Services.AddCors(options => 
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();
 
app.UseHttpsRedirection();

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

app.MapControllers();

app.Run();
