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
    public class OnlineMeetService
    {
        private readonly IOnlineMeetRepo _omr;
        private readonly UserManager<User> _ur;

        public OnlineMeetService(IOnlineMeetRepo omr , UserManager<User> ur)
        {
            _ur = ur;
            _omr = omr;
        }

        public async Task<bool> editOnlineMeet(int id , OnlineMeetEditDTO newmeet)
        {
            var old_meet = await _omr.GetById(id);

            if(old_meet == null) return false;

            OnlineMeetingMapper meetMapper = new OnlineMeetingMapper{};

            meetMapper.editOnlineMeetingMapper(old_meet , newmeet);

            await _omr.Save();

            return true;
        }

        public async Task<object> handelSingleOnlineMeetingFetch(string user_id , int meet_id)
        {
            var user = await _ur.FindByIdAsync(user_id);

            if(user == null) return null;

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var meet  = await _omr.GetSingleOnlineMeeting(sort,meet_id);

            if(meet == null) return null;

            return  new
            {
               division = meet.Division,
               faculty = meet.Faculty,
               notes = meet.Notes,
               id = meet.Id,
               date = meet.OnlineMeetingDate,
               semester = meet.semester,
               subject = meet.Subject,
               title = meet.Title,
               year = meet.Year  
            };
        }
    }
}