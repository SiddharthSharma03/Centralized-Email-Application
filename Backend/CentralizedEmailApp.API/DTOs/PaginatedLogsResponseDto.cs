namespace CentralizedEmailApp.API.DTOs
{
    public class PaginatedLogsResponseDto
    {
        public IEnumerable<EmailLogResponseDto> Logs { get; set; } = new List<EmailLogResponseDto>();
        public int TotalRecords { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}