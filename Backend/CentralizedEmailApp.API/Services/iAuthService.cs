using CentralizedEmailApp.API.Models;

namespace CentralizedEmailApp.API.Services
{
    public interface IAuthService
    {
        string CreateToken(User user);
    }
}
