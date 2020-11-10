using System;

namespace DatingApp.API.Models
{
    public class Photo
    {
        public User User{get;set;}
        public int UserId{get;set;}
        public int Id { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public DateTime DateAdded{get;set;}
        public bool IsMain { get;set; }
        public bool IsPublic{get;set;}

        public string PublicId { get; set; }
    }
}