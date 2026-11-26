using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Repos.interfaces
{
    public interface IQuizzesRepo : IGenericRepo<Quizzes>
    {
        Task<IList<Quizzes>> GetAllQuizzesWithStudentSort(UploadSort sort);
        Task<Quizzes> GetSingleQuiz(int quiz_id , UploadSort ?sort = null);
    }
}