using CentralizedEmailApp.API.Data;
using CentralizedEmailApp.API.DTOs;
using CentralizedEmailApp.API.Models;
using CentralizedEmailApp.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CentralizedEmailApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly AppDbContext _context;

        public EmailController(IEmailService emailService, AppDbContext context)
        {
            _emailService = emailService;
            _context = context;
        }


        // 1. SINGLE EMAIL DISPATCH
        
        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] SendEmailRequestDto request)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var app = await _context.Applications.FirstOrDefaultAsync(a => a.Name == request.AppName);
            if (app == null || app.Status == "Disabled")
            {
                return BadRequest(new { message = "Access Denied: Application is unregistered or disabled." });
            }

            bool isSuccess = true;
            string? errorReason = null;


            try
            {
                // Uncomment this when a real SMTP server is configured
                //await _emailService.SendEmailAsync(request.Recipient, request.Subject, request.Body);

                // To forcefully test the error box feature, uncomment this line:
                //throw new Exception("CRITICAL: Single Email SMTP connection refused on port 587.");

                isSuccess = true;
            }
            catch (Exception ex)
            {
                isSuccess = false;
                errorReason = ex.Message;
            }

            // 3. DATABASE LOGGING
            _context.EmailLogs.Add(new EmailLog
            {
                AppId = request.AppName,
                Recipient = request.Recipient,
                Subject = request.Subject,
                Body = request.Body,
                Status = isSuccess ? "Success" : "Failed",
                ErrorMessage = errorReason,
                SentAt = DateTime.Now,
                CampaignId = null
            });
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = isSuccess,
                message = isSuccess ? "Email dispatched." : "Email failed.",
                error = errorReason
            });
        }

        // 2. BULK CSV DISPATCH

        [HttpPost("bulk")]
        public async Task<IActionResult> SendBulkEmails([FromQuery] int? campaignId, [FromBody] List<BulkEmailRequestDto> emailRequests)
        {
            if (emailRequests == null || emailRequests.Count == 0) return BadRequest("List is empty.");

            var activeApps = await _context.Applications
                .Where(a => a.Status != "Disabled")
                .Select(a => a.Name)
                .ToListAsync();

            var validAppNames = new HashSet<string>(activeApps);

            var logsToSave = new List<EmailLog>();
            int successCount = 0;
            int failedCount = 0;

            // 2. PROCESS ENTIRE BATCH
            foreach (var request in emailRequests)
            {

                if (!validAppNames.Contains(request.AppId))
                {
                    failedCount++;

                    continue;
                }

                bool isSuccess = false;
                string? errorReason = null;

                try
                {
                    // await _emailService.SendEmailAsync(...)


                    // To test the error box, uncomment this line for the specifically bulk:
                    //throw new Exception("CRITICAL TIMEOUT: SMTP gateway at mail.collabera.com refused the connection.");


                    isSuccess = true;
                    successCount++;
                }
                catch (Exception ex)
                {
                    isSuccess = false;
                    failedCount++;
                    errorReason = ex.Message;
                }


                logsToSave.Add(new EmailLog
                {
                    AppId = request.AppId,
                    Recipient = request.Recipient,
                    Subject = request.Subject,
                    Body = request.Body,
                    Status = isSuccess ? "Success" : "Failed",
                    ErrorMessage = errorReason,
                    SentAt = DateTime.Now,
                    CampaignId = campaignId
                });
            }

            // 3. DATABASE LOGGING (Batch Insert)
            await _context.EmailLogs.AddRangeAsync(logsToSave);
            await _context.SaveChangesAsync();

 
            return Ok(new
            {
                Message = "Bulk dispatch complete.",
                TotalAttempted = emailRequests.Count,
                Successful = successCount,
                Failed = failedCount
            });
        }
    }
}