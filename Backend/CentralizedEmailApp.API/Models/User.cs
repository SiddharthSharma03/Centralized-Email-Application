using System.ComponentModel.DataAnnotations;

namespace CentralizedEmailApp.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public byte[] PasswordHash { get; set; } = Array.Empty<byte>();

        [Required]
        public byte[] PasswordSalt { get; set; } = Array.Empty<byte>();

        [Required]
        public string Role { get; set; } = "Employee";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
    
}