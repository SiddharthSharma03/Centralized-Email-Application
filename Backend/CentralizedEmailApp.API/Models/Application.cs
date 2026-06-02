using System;
using System.Collections.Generic;

namespace CentralizedEmailApp.API.Models
{
    public class Application
    {

        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        // A unique API Key we will generate so other apps can't use your service without permission
        public string ApiKey { get; set; } = Guid.NewGuid().ToString();

        // Contact person for this application if needed
        public string? ContactEmail { get; set; } = string.Empty;

        public ICollection<EmailLog> EmailLogs { get; set; } = new List<EmailLog>();

        public string Status { get; set; } = "Active";


    }
}