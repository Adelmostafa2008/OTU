using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Service;

namespace backend.Mappers
{
    public class QuizMapper
    {
        public Quizzes editquizmapper(QuizEditDTO newQuiz , Quizzes quiz)
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

            if (!string.IsNullOrEmpty(newQuiz!.UploadContentType))
            {
            quiz.UploadContentType = newQuiz.UploadContentType;   
            if(newQuiz!.UploadContentType == "link")
            {
                quiz.Link = newQuiz.UploadLink;
                quiz.Text = null;
                quiz.filesdetails = null;
            }else if(newQuiz.UploadContentType == "text")
            {
                quiz.Link = null;
                quiz.Text = newQuiz.UploadText;
                quiz.filesdetails = null;
                }
                else
                {
                    quiz.Link = null;
                    quiz.Text = null;
                }
            }

            return quiz;    
        }

        public Quizzes NormalUploadQuizMapper(QuizUploadDTO item , User user)
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
              UploaderName = user.givenName,
              Link = item.UploadContentType == "link" ? item.UploadLink : null,
              Text = item.UploadContentType == "text" ? item.UploadText : null,
              UploadContentType = item.UploadContentType,
              filesdetails = null
            };

            return newQuiz;

        }
        public Quizzes UploadQuizWithDocsMapper(QuizUploadDTO item , User user , IList<Quizfiles> files)
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
              UploaderName = user.givenName,
              Link = item.UploadContentType == "link" ? item.UploadLink : null,
              Text = item.UploadContentType == "text" ? item.UploadText : null,
              UploadContentType = item.UploadContentType,
              filesdetails = files
            };

            return newQuiz;

        }

        public GetQuizDetailsDTO GetQuizDetailsMapper (Quizzes quiz , IList<string> urls , string userid , string role)
        {
            return new GetQuizDetailsDTO
            {
                Division = quiz.Division,
                Faculty = quiz.Faculty,
                filesurls = urls.Any() ? urls : null,
                flag = true,
                id = quiz.Id,
                iscreator = role == "admin" || quiz.Uploader!.Id == userid,
                link = quiz.UploadContentType == "link" ? quiz.Link : null,
                text = quiz.UploadContentType == "text" ? quiz.Text : null,
                msg = "",
                notes = quiz.Notes,
                semester = quiz.semester,
                Subject = quiz.Subject,
                title = quiz.Title,
                UploadContentType = quiz.UploadContentType,
                uploadername = quiz.Uploader!.givenName,
                Year = quiz.Year,
                date = quiz.QuizDate
            };
        }

        public GetQuizDetailsDTO_Edit GetQuizDetailsMapper_Edit (Quizzes quiz , IList<files> Files)
        {
            return new GetQuizDetailsDTO_Edit
            {
                Division = quiz.Division,
                Faculty = quiz.Faculty,
                files = Files.Any() ? Files : null,
                flag = true,
                id = quiz.Id,
                link = quiz.UploadContentType == "link" ? quiz.Link : null,
                text = quiz.UploadContentType == "text" ? quiz.Text : null,
                msg = "",
                notes = quiz.Notes,
                semester = quiz.semester,
                Subject = quiz.Subject,
                title = quiz.Title,
                UploadContentType = quiz.UploadContentType,
                Year = quiz.Year,
                date = quiz.QuizDate
            };
        }
        
    }
}


