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
        private readonly IOnlineMeetRepo _repo;
        private readonly UserManager<User> _manager;

        public OnlineMeetService(IOnlineMeetRepo omr , UserManager<User> ur)
        {
            _manager = ur;
            _repo = omr;
        }

        public async Task<bool> EditOnlineMeeting(int id , OnlineMeetEditDTO newmeet)
        {
            var old_meet = await _repo.GetById(id);

            if(old_meet == null) return false;

            OnlineMeetingMapper meetMapper = new OnlineMeetingMapper{};

            meetMapper.editOnlineMeetingMapper(old_meet , newmeet);

            await _repo.Save();

            return true;
        }

        public async Task<object> HandelSingleOnlineMeetingFetch(string user_id , int meet_id)
        {
            var user = await _manager.FindByIdAsync(user_id);

            if(user == null) return null;

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var meet  = await _repo.GetSingleOnlineMeeting(sort,meet_id);

            if(meet == null) return null;

            var role = await _manager.GetRolesAsync(user);

            if(role[0] == "admin")
            {
                user_id = "admin";
            }

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
               year = meet.Year  ,
               uploadername = meet.UploaderName,
               iscreator = user_id != "admin" ? user_id == meet.UploaderId : true
            };
        }

        public async Task<result> UploadOnlineMeeting(OnlineMeetUploadDTO meet)
        {
            var user = await _manager.FindByIdAsync(meet.userid);

            if(user == null) return new result{flag = false , msg = "Invalid User ID."};

            OnlineMeetingMapper mapper = new OnlineMeetingMapper{};

            var new_meet = mapper.UploadOnlineMeetingMapper(meet , user);

            await _repo.Create(new_meet);

            return new result{flag = true , msg = "Online Meeting Uploaded Successfully."};
        }
    }
}