using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.data;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repos
{
    public class UserRepo : GenericRepo<User>, IUserRepo
    {
        public UserRepo(AppDb db) : base(db)
        {
        }

        public async Task<User> GetUserByRefreshToken(string ttt)
        {
            var user = await _db.users.FirstOrDefaultAsync(x => x.RefreshToken == ttt);
            return user;    
        }
    }
}