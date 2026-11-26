using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Service;

namespace backend.Mappers
{
    public class LessonsMapper
    {
        public  IList<lessons_result> GetLessonMapper(IList<Lessons> lessons , IList<string> urls)
        {
            IList<lessons_result> res = [];

            for(int i = 0 ; i < lessons.Count ; i++ )
            {
                var element = new lessons_result
                {
                    id = lessons[i].Id,
                    division = lessons[i].Division,
                    faculty = lessons[i].Faculty,
                    link = lessons[i].Link,
                    notes = lessons[i].Notes,
                    semester = lessons[i].semester,
                    subject = lessons[i].Subject,
                    title = lessons[i].Title,
                    uploadDate = lessons[i].UploadDate,
                    uploadername = lessons[i].UploaderName,
                    year = lessons[i].Year,
                    type = lessons[i].Type,
                    msg = "",
                    flag = true ,
                    preveiwurl = urls[i],
                    UploadContentType = lessons[i].UploadContentType
                };

                res.Add(element);
            }

            return res;
        }

        public Lessons NormalUploadLessonMapper(UploadAndEditDTO item , User user)
        {
             Lessons newLesson = new Lessons
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Link = item.UploadContentType == "link" ? item.UploadLink : null,
              Notes = item.Notes,
              Text = item.UploadContentType == "text" ?  item.UploadText : null,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year  ,
              Type = item.Type,
              UploadDate = DateTime.UtcNow
              ,Uploader = user,
              UploaderId = user.Id,
              UploaderName = user.givenName,
              filesdetails = null,
              UploadContentType = item.UploadContentType
            };

            return newLesson;
        }

         public Lessons UploadLessonMapperWithDocuments(UploadAndEditDTO item , User user , IList<Lessonfiles> fileswithkeys)
        {
             Lessons newLesson = new Lessons
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Link = null,
              Notes = item.Notes,
              filesdetails = fileswithkeys,
              Text = null,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year  ,
              Type = item.Type,
              UploadDate = DateTime.UtcNow
              ,Uploader = user,
              UploaderId = user.Id,
              UploaderName = user.givenName,
              UploadContentType = item.UploadContentType
            };

            return newLesson;
        }

        public void EditLessonMapper(UploadAndEditDTO newLesson , Lessons lesson)
        {

            if(newLesson.UploadContentType == "link")
            {
                
            if(!string.IsNullOrEmpty(newLesson.UploadLink) && newLesson.UploadLink != lesson.Link)
            {
                lesson.Link = newLesson.UploadLink;
            }
            lesson.Text = null;
            lesson.filesdetails = null;
            }
            if(newLesson.UploadContentType == "text")
            {
                
            if(!string.IsNullOrEmpty(newLesson.UploadText) && newLesson.UploadText != lesson.Text)
            {
                lesson.Text = newLesson.UploadText;
            }

            lesson.Link = null;
            lesson.filesdetails = null;
            }
            else
            {
                lesson.Link = null;
                lesson.Text = null;
            }


            if(!string.IsNullOrEmpty(newLesson.Type) && newLesson.Type != lesson.Type)
            {
                lesson.Type = newLesson.Type;
            }
            if(!string.IsNullOrEmpty(newLesson.Title) && newLesson.Title != lesson.Title)
            {
                lesson.Title = newLesson.Title;
            }
            if(!string.IsNullOrEmpty(newLesson.Faculty) && newLesson.Faculty != lesson.Faculty)
            {
                lesson.Faculty = newLesson.Faculty;
            }
            if(!string.IsNullOrEmpty(newLesson.Division) && newLesson.Division != lesson.Division)
            {
                lesson.Division = newLesson.Division;
            }
            if(!string.IsNullOrEmpty(newLesson.Subject) && newLesson.Subject != lesson.Subject)
            {
                lesson.Subject = newLesson.Subject;
            }
            if(newLesson.Year != lesson.Year)
            {
                lesson.Year = newLesson.Year;
            }
            if(!string.IsNullOrEmpty(newLesson?.semester) && newLesson.semester != lesson.semester)
            {
                lesson.semester = newLesson.semester;
            }
            if( newLesson?.Notes != lesson.Notes)
            {
                lesson.Notes = newLesson?.Notes;
            }
            if(!string.IsNullOrEmpty(newLesson.UploadContentType) && newLesson.UploadContentType != lesson.UploadContentType)
            {
                lesson.UploadContentType = newLesson.UploadContentType;
            }
        }
    }
}