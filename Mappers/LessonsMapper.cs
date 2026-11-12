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
        public  IList<lessons_result> GetLessonMapper(IList<Lessons> lessons )
        {
            IList<lessons_result> res = [];

            foreach(var i in lessons)
            {
                var element = new lessons_result
                {
                    division = i.Division,
                    faculty = i.Faculty,
                    link = i.Link,
                    notes = i.Notes,
                    semester = i.semester,
                    subject = i.Subject,
                    title = i.Title,
                    uploadDate = i.UploadDate,
                    uploadername = i.UploaderName,
                    year = i.Year,
                    type = i.Type,
                    msg = "",
                    flag = true
                };

                res.Add(element);
            }

            return res;
        }

        public Lessons UploadLessonMapper(UploadDTO item , User user)
        {
             Lessons newLesson = new Lessons
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Link = item.Link,
              Notes = item.Notes,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year  ,
              Type = item.Type,
              UploadDate = DateTime.UtcNow
              ,Uploader = user,
              UploaderId = user.Id,
              UploaderName = user.givenName
            };

            return newLesson;
        }
    }
}