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
        private readonly UserManager<User> _manager;

        public QuizService(IQuizzesRepo qr , UserManager<User> ur)
        {
            _manager = ur;
            _qr = qr;
        }

        public async Task<bool> EditQuiz(int id ,QuizzEditDTO newquiz)
        {
            var quiz = await _qr.GetById(id);

            if(quiz == null) return false;

            QuizMapper mapper = new QuizMapper{};

            mapper.editquizmapper(newquiz , quiz);

            await _qr.Save();

            return true;
        }

        public async Task<object> HandelSingleQuizFetch(string user_id , int quiz_id)
        {
            var user = await _manager.FindByIdAsync(user_id);

            if(user == null) return null;

            var role = await _manager.GetRolesAsync(user);

            if(role[0] == "admin")
            {
                user_id = "admin";
            }

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
               year = quiz.Year  ,
               uploadername = quiz.UploaderName,
               iscreator = user_id != "admin" ? user_id == quiz.UploaderId : true
            };
        }

        public async Task<result> UploadQuiz(QuizzUploadDTO quiz)
        {
            var user = await _manager.FindByIdAsync(quiz.userid);

            if(user == null) return new result{flag = false , msg = "Invalid Uploader ID."};

            QuizMapper mapper = new QuizMapper{};

            var new_quiz = mapper.UploadQuizMapper(quiz , user);

            await _qr.Create(new_quiz);

            return new result{flag = true , msg = "Quiz Uploaded Successfully."};
        }
    }
}