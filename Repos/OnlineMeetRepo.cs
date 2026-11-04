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
            var mts = await _db.onlineMeetings.Where(x => x.Division == sort.Division && x.Faculty == sort.Faculty && x.Year == sort.Year).ToListAsync();

            return mts;
        }

        public async Task<OnlineMeetings> GetSingleOnlineMeeting(UploadSort sort , int meet_id)
        {
            var mt = await _db.onlineMeetings.Where(x => x.Division == sort.Division && x.Faculty == sort.Faculty && x.Year == sort.Year).FirstOrDefaultAsync(x => x.Id == meet_id);

            return mt;
        }
    }
}