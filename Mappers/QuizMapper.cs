using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Mappers
{
    public class QuizMapper
    {
        public Quizzes editquizmapper(QuizzEditDTO newQuiz , Quizzes quiz)
        {
            if(!string.IsNullOrEmpty(newQuiz.Title) && newQuiz.Title != quiz.Title)
            {
                quiz.Title = newQuiz.Title;
            }
            if(!string.IsNullOrEmpty(newQuiz.Faculty) && newQuiz.Faculty != quiz.Faculty)
            {
                quiz.Faculty = newQuiz.Faculty;
            }
            if(!string.IsNullOrEmpty(newQuiz.Division) && newQuiz.Division != quiz.Division)
            {
                quiz.Division = newQuiz.Division;
            }
            if(!string.IsNullOrEmpty(newQuiz.Subject) && newQuiz.Subject != quiz.Subject)
            {
                quiz.Subject = newQuiz.Subject;
            }
            if(newQuiz.Year != quiz.Year)
            {
                quiz.Year = newQuiz.Year;
            }
            if(!string.IsNullOrEmpty(newQuiz?.semester) && newQuiz.semester != quiz.semester)
            {
                quiz.semester = newQuiz.semester;
            }
            if(newQuiz?.Notes != quiz.Notes)
            {
                quiz.Notes = newQuiz?.Notes;
            }
            if(newQuiz?.QuizDate != null && newQuiz.QuizDate != quiz.QuizDate)
            {
                quiz.QuizDate = newQuiz.QuizDate;
            }

            return quiz;    
        }

        public Quizzes UploadQuizMapper(QuizzUploadDTO item , User user)
        {
            Quizzes newQuiz = new Quizzes
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Notes = item.Notes,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year,
              QuizDate = item.QuizDate,  
              Uploader = user,
              UploaderId = user.Id,
              UploaderName = user.givenName
            };

            return newQuiz;

        }
    }
}


