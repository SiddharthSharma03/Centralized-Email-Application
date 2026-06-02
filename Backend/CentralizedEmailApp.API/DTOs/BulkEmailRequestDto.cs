namespace CentralizedEmailApp.API.DTOs
{
    public class BulkEmailRequestDto
    {
        public string AppId { get; set; }
        public string Recipient { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }


    }
}