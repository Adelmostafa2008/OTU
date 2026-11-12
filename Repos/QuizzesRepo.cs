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
    public class QuizzesRepo : GenericRepo<Quizzes>, IQuizzesRepo
    {
        public QuizzesRepo(AppDb _db) : base(_db)
        {
        }

        public async Task<IList<Quizzes>> GetAllQuizzesWithStudentSort(UploadSort sort)
        {
            var qzs =  _db.quizzes.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                qzs = qzs.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                qzs = qzs.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                qzs = qzs.Where(x => x.Year == sort.Year);
            }

            return await qzs.ToListAsync();
        }

        public async Task<Quizzes> GetSingleQuiz(UploadSort sort, int quiz_id)
        {
            var qz = _db.quizzes.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                qz = qz.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                qz = qz.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                qz = qz.Where(x => x.Year == sort.Year);
            }

            return await qz.FirstOrDefaultAsync(x => x.Id == quiz_id);
        }
    }
}