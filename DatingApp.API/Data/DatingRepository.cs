using System.Collections.Generic;
using System.Threading.Tasks;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using DatingApp.API.Helpers;
using System;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;
        public DatingRepository(DataContext context)
        {
            _context = context;
        }
        public void Add<T>(T entity) where T : class
        {
            _context.Add(entity);
        }
        public void Delete<T>(T entity) where T : class
        {
            _context.Remove(entity);
        }
        public async Task<Photo> GetPhoto(int id)
        {
            var photo = await _context.Photos.FirstOrDefaultAsync(p => p.Id == id);
            return photo;
        }
        public async Task<User> GetUser(int userId)
        {
            var user = await _context.Users.Include(p => p.Photos).FirstOrDefaultAsync(u => u.Id == userId);
            return user;
        }
        /*
        public async Task<IEnumerable<User>> GetUsers()
        {
            var users = await _context.Users.Include( p=> p.Photos).ToListAsync();
            return users;
        }
        */



        public async Task<bool> SaveAll()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<Photo> GetMainPhotoForUser(int userId)
        {
            var photo = await _context.Photos
                                        .Where(p => p.UserId == userId)
                                        .Where(p => p.IsMain == true)
                                        .FirstOrDefaultAsync();
            return photo;
        }

        public async Task<PagedList<User>> GetUsers(UserParams userParams)
        {
            var users = _context.Users.Include(p => p.Photos)
                .OrderByDescending(u => u.LastActive)
                .AsQueryable();
            //remove current user from the result set.
            users = users.Where(u => u.Id != userParams.UserId);
            //bring only the selected gender.
            users = users.Where(u => u.Gender == userParams.Gender);

            if (userParams.Likers)
            {
                var userLikers = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikers.Contains(u.Id));
            }

            if (userParams.Likees)
            {
                var userLikees = await GetUserLikes(userParams.UserId, userParams.Likers);
                users = users.Where(u => userLikees.Contains(u.Id));
            }

            //Adding Age Filter
            if (userParams.MinAge != 18 || userParams.MaxAge != 99)
            {
                var minDOB = DateTime.Today.AddYears(-userParams.MaxAge - 1);
                var maxDOB = DateTime.Today.AddYears(-userParams.MinAge);

                users = users.Where(u => u.DateOfBirth >= minDOB && u.DateOfBirth <= maxDOB);
            }



            //Add sorting 
            if (!string.IsNullOrEmpty(userParams.OrderBy))
            {
                switch (userParams.OrderBy)
                {
                    case "created":
                        users = users.OrderByDescending(u => u.Created);
                        break;
                    default:
                        users = users.OrderByDescending(u => u.LastActive);
                        break;
                }
            }

            return await PagedList<User>.CreateAsync(users,
                                                    userParams.PageNumber,
                                                    userParams.PageSize);
        }

        public async Task<Like> GetLike(int userId, int recipientId)
        {
            return await _context.Likes.FirstOrDefaultAsync(u => u.LikerId == userId && u.LikeeId == recipientId);
        }

        private async Task<IEnumerable<int>> GetUserLikes(int id, bool likers)
        {

            var user = await _context.Users.Include(x => x.Likers)
                                            .Include(x => x.Likees)
                                            .FirstOrDefaultAsync(u => u.Id == id);
            if (likers)
            {
                return user.Likers.Where(u => u.LikeeId == id).Select(i => i.LikerId);
            }
            else
            {
                return user.Likers.Where(u => u.LikerId == id).Select(i => i.LikeeId);
            }
        }

        public async Task<Message> GetMessage(int id) {
            return await _context.Messages.FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<IEnumerable<Message>> GetMessageThread(int userId, int recipientId) {
            var messages = await _context.Messages
                         .Include(u => u.Sender).ThenInclude(p => p.Photos)
                         .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                         .Where(x => x.RecipientId == userId &&
                                x.RecipientDeleted==false && 
                                x.SenderId == recipientId ||
                                x.RecipientId == recipientId &&
                                x.SenderId == userId &&
                                x.SenderDeleted == false)
                                .OrderByDescending(x => x.MessageSent)
                                .ToListAsync();

            return messages;
        }

        public async Task<PagedList<Message>> GetMessagesForUser(MessageParams messageParams)
        {
            var messages = _context.Messages
                         .Include(u => u.Sender).ThenInclude(p => p.Photos)
                         .Include(u => u.Recipient).ThenInclude(p => p.Photos)
                         .AsQueryable();

            switch (messageParams.MessageContainer)
            {
                case "Indox":
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId && u.RecipientDeleted == false);
                    break;
                case "Outbox":
                    messages = messages.Where(u => u.SenderId == messageParams.UserId && u.SenderDeleted == false);
                    break;
                default:
                    messages = messages.Where(u => u.RecipientId == messageParams.UserId &&
                                 u.IsRead == false &&
                                u.RecipientDeleted == false
                    );
                    break;
            }

            messages = messages.OrderByDescending(d => d.MessageSent);

            return await PagedList<Message>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
        }
    }
}