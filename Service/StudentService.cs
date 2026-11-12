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
    public class result
    {
        public bool flag {get;set;} = false;
        public string msg {get;set;} = "";
    }
    public class lessons_result : result
    {
        public string? title {get;set;} 
        public string ?faculty {get;set;}
        public string ?division {get;set;}
        public string ?subject {get;set;}
        public int? year {get;set;}
        public string ? semester {get;set;}
        public string ? notes {get;set;}
        public string? link {get;set;}
        public DateTime ?uploadDate {get;set;} 
        public string ?type {get;set;}
        public string ?uploadername {get;set;}
    }
    public class StudentService
    {
        private readonly UserManager<User> _ur;
        private readonly ILessonRepo _lr;

        public StudentService(UserManager<User> ur , ILessonRepo lr)
        {
            _lr = lr;
            _ur = ur;
        }

        public async Task<result> changePassword(string userid , string oldpass , string newpass)
        {
            var user = await _ur.FindByIdAsync(userid);

            if(user == null) return new result{flag = false , msg = "Invalid User ID."};

            var taskres  = await _ur.ChangePasswordAsync(user , oldpass , newpass);

            if(!taskres.Succeeded) return new result{flag = false , msg = "Faild : Old Password Is Invalid."};

            return new result{flag = true , msg = "Password Changed Successfully."};
        }  
        public async Task<IList<lessons_result>> GetNewestUploads(string userid)
        {
            var user = await _ur.FindByIdAsync(userid);

            if(user == null) return [new lessons_result{flag = false , msg = "invalid User ID."}];

            UploadSort sort = new UploadSort
            {
              Division = user.Division,
              Faculty = user.Faculty,
              Year = user.Year  
            };

            var lessons = await _lr.GetNewestLessonsUploaded(sort);

            if(!lessons.Any() || lessons.Count == 0) return [new lessons_result{flag = false , msg = "No Lessons Added Yet."}];

            LessonsMapper _lm = new LessonsMapper{};

            var res = _lm.GetLessonMapper(lessons);

            return res;
        }  
    }
}