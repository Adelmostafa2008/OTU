using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.data;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repos
{
    public class OnlineMeetRepo : GenericRepo<OnlineMeetings>, IOnlineMeetRepo
    {
        public OnlineMeetRepo(AppDb _db) : base(_db)
        {
        }

        public async Task<IList<OnlineMeetings>> GetAllMeetsWithStudentSort(UploadSort sort)
        {
            var mts = _db.onlineMeetings.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                mts = mts.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                mts = mts.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                mts = mts.Where(x => x.Year == sort.Year);
            }

            return await mts.ToListAsync();
        }

        public async Task<OnlineMeetings> GetSingleOnlineMeeting(UploadSort sort , int meet_id)
        {
            var mt = _db.onlineMeetings.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                mt = mt.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                mt = mt.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                mt = mt.Where(x => x.Year == sort.Year);
            }

            return await mt.FirstOrDefaultAsync(x => x.Id == meet_id);
        }
    }
}