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
            var quizzes =  _db.quizzes.AsQueryable();

            if (!string.IsNullOrEmpty(sort.Division))
            {
                quizzes = quizzes.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                quizzes = quizzes.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                quizzes = quizzes.Where(x => x.Year == sort.Year);
            }

            return await quizzes.ToListAsync();
        }

        public async Task<Quizzes> GetSingleQuiz(int quiz_id , UploadSort ?sort = null)
        {
            var quiz = _db.quizzes.Include(x => x.Uploader).Include(x => x.filesdetails).AsQueryable();

            if(sort != null)
            {
                

            if (!string.IsNullOrEmpty(sort.Division))
            {
                quiz = quiz.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                quiz = quiz.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                quiz = quiz.Where(x => x.Year == sort.Year);
            }

            }
            return await quiz.FirstOrDefaultAsync(x => x.Id == quiz_id);
        }
    }
}