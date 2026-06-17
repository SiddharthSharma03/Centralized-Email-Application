using CentralizedEmailApp.API.Data;
using CentralizedEmailApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace CentralizedEmailApp.API.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AppRegistryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppRegistryController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: Downloads the list of apps to your Angular frontend
        [HttpGet]
        public async Task<IActionResult> GetApps()
        {
            var apps = await _context.Applications.ToListAsync();
            return Ok(apps);
        }

        // 2. POST: Registers a new application
        [HttpPost]
        public async Task<IActionResult> RegisterApp([FromBody] Application newApp)
        {
            _context.Applications.Add(newApp);
            await _context.SaveChangesAsync();
            return Ok(newApp);
        }

        // 3. PUT: Updates the Status (Active/Testing/Disabled)
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            var app = await _context.Applications.FindAsync(id);
            if (app == null) return NotFound();

            app.Status = newStatus;
            await _context.SaveChangesAsync();

            return Ok(app);
        }
    }
}