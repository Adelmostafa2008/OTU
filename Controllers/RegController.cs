using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repos;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegController : ControllerBase
    {
        private readonly UserManager<User> _user_manager;
        private readonly ITokenGen _token;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _config;
        private readonly IUserRepo _ur;
        public RegController(UserManager<User> user_manager , IUserRepo ur,IConfiguration config,  ITokenGen token, SignInManager<User> sign)
        {
            _config = config;
            _ur = ur;
            _token = token;
            _user_manager = user_manager;
            _signInManager = sign;
            
        }

        [HttpPost ("create")]
        [Authorize] // (Roles = "admin")
        public async Task<IActionResult> CreateNew([FromBody] UserDTO user)
        {
            try
            {
                if (!ModelState.IsValid)
                {    
                   return BadRequest("One or more validations didnot get specified");
                }
            
                var userEmail = await _user_manager.FindByEmailAsync(user.email);
                if (userEmail != null)
                {
                    return BadRequest("Email Address Already Exists");
                }
                if(user.code != null)
                {
                    
                var userCode = await _ur.FindByUniversityCode(user.code);
                if(userCode != null)
                {
                    return BadRequest("University Code Already Exists.");
                }
                }
                var newUser = new User
                {   
                    UniversityCode = user.code,
                    Division = user.Division,
                    Faculty = user.Faculty,
                    Group = user.Group,
                    Email = user.email,
                    givenName = user.name,
                    UserName = user.name.Split(" ")[0] + ".OTU-"+ user.code 
                   
                };

                var createdUser = await _user_manager.CreateAsync(newUser, user.password);
                
                if (createdUser.Succeeded)
                {
                    var Role = await _user_manager.AddToRoleAsync(newUser, user.role);
                    if (Role.Succeeded)
                    {
                        
                        return Ok(
                            $"New {user.role} added !"
                        );
                    }
                    else
                    {
                        return BadRequest(Role.Errors);
                    }
                }
                else
                {
                    
                    return BadRequest(createdUser.Errors);
                }
            }
            catch (Exception e)
            {

                return BadRequest(e.Message);
            }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDTO login)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _user_manager.FindByEmailAsync(login.email);

            if (user == null) return BadRequest("Invalid Email or Password.");

            var result = await _signInManager.CheckPasswordSignInAsync(user, login.password, false);

            if (!result.Succeeded) return BadRequest("Invalid Email or Password.");


            var token = await TokenGeneration(user);
            return Ok(await LoginResponseAsync(user , token));


        }

        [HttpPost("Refresh")]
        public async Task<IActionResult> RefreshTheRefreshToken()
        {
            
            var refreshtoken = Request.Cookies["RefreshToken"];

            if(refreshtoken == null)
            {
                return Unauthorized();
            }
             
             //Console.WriteLine($"Refresh Token : ${refreshtoken}");
            var user = await _ur.GetUserByRefreshToken(refreshtoken);

            if (user.RefreshTokenExpiryDate <= DateTime.UtcNow) return Unauthorized();

            var newtoekn = _token.CreateToken(user);
            var newRefreshtoken =  GenerateRefreshToken();
            user.RefreshToken = newRefreshtoken;
            user.RefreshTokenExpiryDate = DateTime.UtcNow.AddDays(7);

            await _ur.Save();

            var opts = new CookieOptions
            {
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                HttpOnly = true,
                SameSite = SameSiteMode.None,
                Secure = true
            };

            Response.Cookies.Append("RefreshToken" , newRefreshtoken , opts);

            return Ok(new
            {
                token = newtoekn
            });

        }
        private string GenerateRefreshToken()
        {
            var randombytes = new byte[64];

            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randombytes);
            }

            return Convert.ToBase64String(randombytes);
        }


        private async Task<string> TokenGeneration(User user)
        {
                        var token = _token.CreateToken(user);
                        var refreshtoken = GenerateRefreshToken();
                        user.RefreshToken = refreshtoken;
                        user.RefreshTokenExpiryDate = DateTime.UtcNow.AddDays(7);
                        await _ur.Save();

                        var opts = new CookieOptions
                        {
                            HttpOnly = true,
                            SameSite = SameSiteMode.Lax, // change to none on production
                            Secure = false, //change to true on production
                            Expires = DateTime.UtcNow.AddDays(7)
                        };

                        Response.Cookies.Append("RefreshToken" , refreshtoken , opts);   

                        return token;
        }

        private async Task<object> LoginResponseAsync(User user , string token)
        {
            var roles = await _user_manager.GetRolesAsync(user);
            return new
                            {
                                Id = user.Id,
                                role = roles[0],
                                name = user.givenName,
                                email = user.Email,
                                Token = token,  
                                phone = user.PhoneNumber,
                                group = user.Group,
                                division = user.Division,
                                faculty = user.Faculty,
                                code = user.UniversityCode,
                                year = user.Year,
                                message = "Logged in Successfully",
                            };
        }

        

    }
}