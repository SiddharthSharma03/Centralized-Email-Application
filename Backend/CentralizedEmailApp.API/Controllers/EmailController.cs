using CentralizedEmailApp.API.Data;
using CentralizedEmailApp.API.DTOs;
using CentralizedEmailApp.API.Models;
using CentralizedEmailApp.API.Services;
using Hangfire; // 🟢 Added for background queuing
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CentralizedEmailApp.API.Controllers
{
    [Authorize(Roles = "Admin,Employee")]
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly AppDbContext _context;
        private readonly IBackgroundJobClient _backgroundJobClient; // 🟢 Injected Hangfire Manager

        public EmailController(IEmailService emailService, AppDbContext context, IBackgroundJobClient backgroundJobClient)
        {
            _emailService = emailService;
            _context = context;
            _backgroundJobClient = backgroundJobClient;
        }

        // =========================================================================
        // 1. SINGLE EMAIL DISPATCH (Now Asynchronous)
        // =========================================================================
        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var app = await _context.Applications.FirstOrDefaultAsync(a => a.Name == request.AppName);
            if (app == null || app.Status == "Disabled")
            {
                return BadRequest(new { message = "Access Denied: Application is unregistered or disabled." });
            }

            // 🚀 Offload email transmission AND db logging to a background thread
            _backgroundJobClient.Enqueue(() => ProcessAndLogEmailAsync(request, null));

            // Instant response! Frontend spinner stops spinning immediately.
            return Ok(new { success = true, message = "Email request accepted and queued for background delivery." });
        }

        // =========================================================================
        // 2. BULK CSV DISPATCH (Industry Standard Granular Multi-Job Queue)
        // =========================================================================
        [HttpPost("bulk")]
        public async Task<IActionResult> SendBulkEmails([FromQuery] int? campaignId, [FromBody] List<BulkEmailRequestDto> emailRequests)
        {
            if (emailRequests == null || emailRequests.Count == 0) return BadRequest("List is empty.");

            var activeApps = await _context.Applications
                .Where(a => a.Status != "Disabled")
                .Select(a => a.Name)
                .ToListAsync();

            var validAppNames = new HashSet<string>(activeApps);
            int queuedCount = 0;
            int rejectedCount = 0;

            foreach (var request in emailRequests)
            {
                if (!validAppNames.Contains(request.AppId))
                {
                    rejectedCount++;
                    continue; // Skip invalid application payloads safely
                }

                // Transform Bulk DTO to standard Send format for the worker method
                var singleRequest = new SendEmailRequestDto
                {
                    AppName = request.AppId,
                    Recipient = request.Recipient,
                    Subject = request.Subject,
                    Body = request.Body
                };

                // 🚀 Enqueue each individual email as its own separate background task
                _backgroundJobClient.Enqueue(() => ProcessAndLogEmailAsync(singleRequest, campaignId));
                queuedCount++;
            }

            return Ok(new
            {
                Message = "Bulk dispatch ingestion complete. Tasks offloaded to background engine.",
                TotalAttempted = emailRequests.Count,
                QueuedSuccessfully = queuedCount,
                RejectedInvalidApp = rejectedCount
            });
        }

        // =========================================================================
        // 3. BACKGROUND WORKER EXECUTION METHOD (Invoked asynchronously by Hangfire)
        // =========================================================================
        [NonAction] // Tells ASP.NET Core this is a background worker method, not an API route
        public async Task ProcessAndLogEmailAsync(SendEmailRequestDto request, int? campaignId)
        {
            bool isSuccess = true;
            string? errorReason = null;

            try
            {
                // Execute real SMTP network handshake completely off the web thread pool
                // await _emailService.SendEmailAsync(request.Recipient, request.Subject, request.Body);

                isSuccess = true;
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorReason = ex.Message;
                throw; // Re-throw the exception so Hangfire dashboard visualizes the failure and schedules retries!
            }
            finally
            {
                // Separate scoped processing context context injection for logging safely
                _context.EmailLogs.Add(new EmailLog
                {
                    AppId = request.AppName,
                    Recipient = request.Recipient,
                    Subject = request.Subject,
                    Body = request.Body,
                    Status = isSuccess ? "Success" : "Failed",
                    ErrorMessage = errorReason,
                    SentAt = DateTime.Now,
                    CampaignId = campaignId
                });

                await _context.SaveChangesAsync();
            }
        }
    }
}