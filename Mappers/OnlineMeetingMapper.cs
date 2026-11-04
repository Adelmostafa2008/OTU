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
        public OnlineMeetings editOnlineMeetingMapper(OnlineMeetings meet , OnlineMeetEditDTO newMeet)
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
            if(newMeet.Year != null && newMeet.Year != meet.Year)
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


            return meet;
        }
    }
}