using System;
namespace CentralizedEmailApp.API.Models
{
    public class EmailLog
    {
        public int Id { get; set; }

        public string AppId { get; set; } = string.Empty;

        public string Recipient { get; set; } = string.Empty;

        public string Subject { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending";

        public DateTime SentAt { get; set; } = DateTime.Now;

        public string? ErrorMessage { get; set; }

        public int? CampaignId { get; set; }
    }
}
