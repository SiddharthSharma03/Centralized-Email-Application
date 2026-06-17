using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CentralizedEmailApp.API.DTOs
{
    public class UserLoginDto
    {

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [PasswordPropertyText]
        public string Password { get; set; } = string.Empty;

    }
}
