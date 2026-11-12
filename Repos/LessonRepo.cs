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
    public class LessonRepo : GenericRepo<Lessons>, ILessonRepo
    {
        public LessonRepo(AppDb _db) : base(_db)
        {
        }

        public async Task<IList<Lessons>> GetAllUploads(UploadSearch search, UploadSort sort, int pageNum)
        {
            var items = _db.lessons.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                items = items.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                items = items.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                items = items.Where(x => x.Year == sort.Year);
            }


            if (!string.IsNullOrWhiteSpace(search.title))
            {
                items = items.Where(c=> c.Title.Contains(search.title));
            }
            if (!string.IsNullOrWhiteSpace(sort.semester))
            {
                items = items.Where(x => x.semester == sort.semester);
            }
            if (!string.IsNullOrWhiteSpace(sort.Subject))
            {
                items = items.Where(x => x.Subject == sort.Subject);
            }
            if(sort.UploadDate > new DateTime(2001 / 9 / 11))
            {
                items = items.Where(x => x.UploadDate >= sort.UploadDate && x.UploadDate < sort.UploadDate.AddMonths(1));
            }

            items = items.Skip((pageNum - 1) * 12).Take(12);

            return await items.ToListAsync();
        }

        public async Task<IList<Lessons>> GetNewestLessonsUploaded(UploadSort sort)
        {
            var lessons = _db.lessons.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                lessons = lessons.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                lessons = lessons.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                lessons = lessons.Where(x => x.Year == sort.Year);
            }

            return await lessons.Take(6).ToListAsync();
        }
    }
}