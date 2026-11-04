using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Identity;

namespace backend.Service
{
    public class QuizService
    {
        private readonly IQuizzesRepo _qr;
        private readonly UserManager<User> _ur;

        public QuizService(IQuizzesRepo qr , UserManager<User> ur)
        {
            _ur = ur;
            _qr = qr;
        }

        public async Task<bool> editQuiz(int id ,QuizzEditDTO newquiz)
        {
            var quiz = await _qr.GetById(id);

            if(quiz == null) return false;

            QuizMapper mapper = new QuizMapper{};

            mapper.editquizmapper(newquiz , quiz);

            await _qr.Save();

            return true;
        }

        public async Task<object> handelSingleQuizFetch(string user_id , int quiz_id)
        {
            var user = await _ur.FindByIdAsync(user_id);

            if(user == null) return null;

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var quiz  = await _qr.GetSingleQuiz(sort,quiz_id);

            if(quiz == null) return null;

            return  new
            {
               division = quiz.Division,
               faculty = quiz.Faculty,
               notes = quiz.Notes,
               id = quiz.Id,
               date = quiz.QuizDate,
               semester = quiz.semester,
               subject = quiz.Subject,
               title = quiz.Title,
               year = quiz.Year  
            };
        }
    }
}