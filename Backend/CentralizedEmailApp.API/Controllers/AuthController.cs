using CentralizedEmailApp.API.Data;
using CentralizedEmailApp.API.DTOs;
using CentralizedEmailApp.API.Models;
using CentralizedEmailApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace CentralizedEmailApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegisterDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // Guardrail: Enforce unique emails
                if (await _context.Users.AnyAsync(u => u.Email == request.Email.ToLower().Trim()))
                {
                    return BadRequest("Email is already registered.");
                }

                using var hmac = new HMACSHA512();

                var user = new User
                {
                    Email = request.Email.ToLower().Trim(),
                    PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
                    PasswordSalt = hmac.Key,
                    Role = "Employee"
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Registration successful!" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Register Exception]: {ex.Message}");
                return StatusCode(500, "An internal error occurred during profile registration.");
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                // 1. Fetch user by email safely
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim());
                if (user == null)
                {
                    return Unauthorized("Invalid corporate email or access password.");
                }

                // 2. Wrap Cryptography verification loop in a safe validation layout
                bool isPasswordCorrect = false;
                try
                {
                    using (var hmac = new HMACSHA512(user.PasswordSalt))
                    {
                        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password));
                        isPasswordCorrect = computedHash.SequenceEqual(user.PasswordHash);
                    }
                }
                catch (Exception cryptoEx)
                {
                    // If hashing throws an internal memory fault, print it out immediately
                    Console.WriteLine($"[Crypto Core Exception]: Hashing evaluation failed - {cryptoEx.Message}");
                    return Unauthorized("Invalid corporate email or access password.");
                }

                // 3. Evaluate flag cleanly outside the resource disposal block
                if (!isPasswordCorrect)
                {
                    return Unauthorized("Invalid corporate email or access password.");
                }

                // 4. Issue the signed token passport
                var token = _authService.CreateToken(user);
                return Ok(new { token = token });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Global Controller Exception]: Login endpoint stalled - {ex.Message}");
                return StatusCode(500, "An internal server error occurred while processing authentication.");
            }
        }
    }
}