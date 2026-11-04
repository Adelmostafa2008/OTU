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
            var qzs = await _db.quizzes.Where(x => x.Division == sort.Division && x.Faculty == sort.Faculty && x.Year == sort.Year).ToListAsync();

            return qzs;
        }

        public async Task<Quizzes> GetSingleQuiz(UploadSort sort, int quiz_id)
        {
            var qz = await _db.quizzes.Where(x => x.Division == sort.Division && x.Faculty == sort.Faculty && x.Year == sort.Year).FirstOrDefaultAsync(c => c.Id == quiz_id);

            return qz;
        }
    }
}