using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Amazon.S3.Model;
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
        public int id {get;set;}
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
        public string ? preveiwurl {get;set;}
    }
    public class StudentService
    {
        private readonly UserManager<User> _manager;
        private readonly ILessonRepo _repo;
        private readonly IFilebaseClient _s3;
        private readonly IConfiguration _config;

        public StudentService(UserManager<User> ur , IConfiguration config , IFilebaseClient s3 , ILessonRepo lr)
        {
            _config = config;
            _s3 = s3;
            _repo = lr;
            _manager = ur;
        }

        public async Task<result> changePassword(string userid , string oldpass , string newpass)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new result{flag = false , msg = "Invalid User ID."};

            var taskres  = await _manager.ChangePasswordAsync(user , oldpass , newpass);

            if(!taskres.Succeeded) return new result{flag = false , msg = "Faild : Old Password Is Invalid."};

            return new result{flag = true , msg = "Password Changed Successfully."};
        }  
        public async Task<IList<lessons_result>> GetNewestUploads(string userid)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return [new lessons_result{flag = false , msg = "invalid User ID."}];

            UploadSort sort = new UploadSort
            {
              Division = user.Division,
              Faculty = user.Faculty,
              Year = user.Year  
            };

            var lessons = await _repo.GetNewestLessonsUploaded(sort);

            if(!lessons.Any() || lessons.Count == 0) return [new lessons_result{flag = false , msg = "No Lessons Added Yet."}];

            LessonsMapper _lm = new LessonsMapper{};

            var client = _s3.CreateClient();

            var urls = new List<string>();

            foreach(var i in lessons)
            {
                
                var keyslist = i.files != null ? i.files.Values.ToList() : null;
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = _config["BucketName"],
                    Expires = DateTime.UtcNow.AddMinutes(3),
                    Key =  keyslist != null ? keyslist[0] : null
                };

                var url = keyslist != null ? await client.GetPreSignedURLAsync(request) : null;

                urls.Add(url);
            
            }
            var res = _lm.GetLessonMapper(lessons , urls);

            return res;
        }  

        public async Task<LessonDetailsDTO> GetLessonByID(int id , string userid)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new LessonDetailsDTO{title = "err" , notes = "Invalid User ID."};

            var role = await _manager.GetRolesAsync(user);

            var lesson = await _repo.GetById(id);

            if(lesson == null) return new LessonDetailsDTO{title = "err" , notes = "Invalid Lesson ID."};
            
            if(role[0] == "student")
            {
                if(lesson.Division != user.Division || lesson.Faculty != user.Faculty || lesson.Year != user.Year) return new LessonDetailsDTO{title = "err" , notes = "You Are Not Authorized To See That , Stop Messing Around."};
            }

            var client = _s3.CreateClient();

                var URLs = new List<string>();

                if(lesson.files != null)
            {
                

                foreach(var i in lesson.files)
                {

                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = _config["BucketName"],
                        Verb = Amazon.S3.HttpVerb.GET,
                        Expires = DateTime.UtcNow.AddMinutes(3),
                        Key  = i.Value
                    };

                    var result = await client.GetPreSignedURLAsync(request);
                    URLs.Add(result);
                }

            }
            return new LessonDetailsDTO { link = lesson.Link , text = lesson.Text, id = lesson.Id , title = lesson.Title , notes = lesson.Notes , uploadername = lesson.UploaderName! , filesurls = URLs , iscreator = lesson.UploaderId == user.Id};
        }
    }
}