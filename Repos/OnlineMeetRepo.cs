using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.data;
using backend.Models;
using backend.Repos.interfaces;

namespace backend.Repos
{
    public class OnlineMeetRepo : GenericRepo<OnlineMeetings>, IOnlineMeetRepo
    {
        public OnlineMeetRepo(AppDb _db) : base(_db)
        {
        }
    }
}