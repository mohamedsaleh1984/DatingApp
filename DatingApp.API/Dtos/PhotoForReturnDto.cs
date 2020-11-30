using System;
using Microsoft.AspNetCore.Http;

namespace DatingApp.API.Dtos
{
    public class PhotoForReturnDto
    {
        public int Id { get; set; }
        public string Url { get; set; }
        public IFormFile File { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded { get; set; }
        public string  PublicId { get; set; }
    }
}