using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Mappers
{
    public class OnlineMeetingMapper
    {
        public void editOnlineMeetingMapper(OnlineMeetings meet , OnlineMeetEditDTO newMeet)
        {
            if(!string.IsNullOrEmpty(newMeet.Title) && newMeet.Title != meet.Title)
            {
                meet.Title = newMeet.Title;
            }
            if(!string.IsNullOrEmpty(newMeet.Faculty) && newMeet.Faculty != meet.Faculty)
            {
                meet.Faculty = newMeet.Faculty;
            }
            if(!string.IsNullOrEmpty(newMeet.Division) && newMeet.Division != meet.Division)
            {
                meet.Division = newMeet.Division;
            }
            if(!string.IsNullOrEmpty(newMeet.Subject) && newMeet.Subject != meet.Subject)
            {
                meet.Subject = newMeet.Subject;
            }
            if(newMeet.Year != meet.Year)
            {
                meet.Year = newMeet.Year;
            }
            if(!string.IsNullOrEmpty(newMeet?.semester) && newMeet.semester != meet.semester)
            {
                meet.semester = newMeet.semester;
            }
            if( newMeet?.Notes != meet.Notes)
            {
                meet.Notes = newMeet?.Notes;
            }
            if(newMeet?.OnlineMeetingDate != null && newMeet.OnlineMeetingDate != meet.OnlineMeetingDate)
            {
                meet.OnlineMeetingDate = newMeet.OnlineMeetingDate;
            }
        }

        public OnlineMeetings UploadOnlineMeetingMapper(OnlineMeetUploadDTO meeting , User user)
        {
            OnlineMeetings newMeeting = new OnlineMeetings
            {
              Faculty = meeting.Faculty,
              Division = meeting.Division,
              Notes = meeting.Notes,
              semester = meeting.semester,
              Subject = meeting.Subject,
              Title = meeting.Title,
              Year = meeting.Year,
              OnlineMeetingDate = meeting.OnlineMeetingDate,
              Uploader = user,
              UploaderId = user.Id,
              UploaderName = user.givenName
            };

            return newMeeting;
        }
    }
}