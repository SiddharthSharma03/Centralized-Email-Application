using CentralizedEmailApp.API.Data;
using CentralizedEmailApp.API.DTOs;
using CentralizedEmailApp.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CentralizedEmailApp.API.Controllers
{
    [Authorize(Roles = "Admin,Employee")]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        // Fetching emaillogs

        [HttpGet("logs")]
        public async Task<IActionResult> GetLogs([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50)
        {
            var totalRecords = await _context.EmailLogs.CountAsync();

            var logs = await _context.EmailLogs
                .OrderByDescending(l => l.SentAt) 
                .Skip((pageNumber - 1) * pageSize) 
                .Take(pageSize) 
                .Select(l => new EmailLogResponseDto
                {
                    Id = l.Id,
                    AppId = l.AppId,
                    Recipient = l.Recipient,
                    Subject = l.Subject,
                    Status = l.Status,
                    SentAt = l.SentAt,
                    ErrorMessage = l.ErrorMessage,
                    CampaignId = l.CampaignId
                })
                .ToListAsync();

            var response = new PaginatedLogsResponseDto
            {
                Logs = logs,
                TotalRecords = totalRecords,
                CurrentPage = pageNumber,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling((double)totalRecords / pageSize)
            };

            return Ok(response);
        }


        // to get the exact timeframe KPI 
        [HttpGet("kpis")]
        public async Task<IActionResult> GetKpis([FromQuery] string timeframe = "all")
        {
            var query = _context.EmailLogs.AsQueryable();

            // SQL filtering based on the dropdown!
            if (timeframe == "week")
            {
                query = query.Where(e => e.SentAt >= DateTime.Now.AddDays(-7));
            }
            else if (timeframe == "month")
            {
                query = query.Where(e => e.SentAt >= DateTime.Now.AddDays(-30));
            }
            else if (timeframe == "day")
            {
                query = query.Where(e => e.SentAt >= DateTime.Now.AddDays(-1));
            }

            var totalMails = await query.CountAsync();
            var failedMails = await query.CountAsync(e => e.Status == "Failed");
            var deliveredMails = totalMails - failedMails;

            double successRate = totalMails == 0 ? 0 : Math.Round(((double)deliveredMails / totalMails) * 100, 1);

            return Ok(new
            {
                TotalMails = totalMails,
                FailedMails = failedMails,
                SuccessRate = successRate
            });
        }
    }
}