using System.Threading.Tasks;

namespace CentralizedEmailApp.API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string recipient, string subject, string body);
    }
}