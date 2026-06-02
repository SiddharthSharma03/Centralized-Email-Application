using System.ComponentModel.DataAnnotations;

namespace CentralizedEmailApp.API.DTOs
{
    public class SendEmailRequestDto
    {
        [Required]
        public string AppName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Recipient { get; set; } = string.Empty;

        [Required]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;
    }
}