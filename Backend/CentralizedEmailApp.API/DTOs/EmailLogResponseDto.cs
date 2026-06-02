using System;

namespace CentralizedEmailApp.API.DTOs
{
    public class EmailLogResponseDto
    {
        public int Id { get; set; }
        public string AppId { get; set; } = string.Empty;
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }

        public string? ErrorMessage {  get; set; } = string.Empty;

        public int? CampaignId { get; set; }


    }
}

