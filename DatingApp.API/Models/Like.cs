using System;

namespace DatingApp.API.Models
{
    public class Like
    {
        public int LikerId { get; set; }
        public int LikeeId { get; set; }
        public User Liker { get; set; }
        public User Likee {get;set;}
        public DateTime When{get;set;}
    }
}