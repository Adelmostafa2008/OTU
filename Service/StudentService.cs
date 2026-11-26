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
        public string? UploadContentType {get;set;}
    }
    public class getsub_result : result
    {
        public IList<string> ?subjects {get;set;}
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

        public async Task<getsub_result> GetSubjects(string userid)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new getsub_result{flag = false , msg = "Invalid User ID."};

            UploadSort sort = new UploadSort
            {
                Division = user.Division,
                Faculty = user.Division,
                Year = user.Year
            };

            var role = await _manager.GetRolesAsync(user);

            var subjectsRes = await _repo.GetSubjectsBasedOnSort(sort , role[0]);

            if(!subjectsRes.Any()) return new getsub_result{flag = false , msg = "No Subjects Found"};

            return new getsub_result{flag = true , msg = "" , subjects = subjectsRes};
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


            for(int i = 0 ; i < lessons.Count ; i ++)
            {
                if(lessons[i].filesdetails != null && lessons[i].filesdetails.Count > 0)
                {
                    
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = _config["BucketName"],
                    Expires = DateTime.UtcNow.AddMinutes(3),
                    Key = lessons[i].filesdetails != null ? lessons[i].filesdetails[0].key : null
                };

                var url = lessons[i].filesdetails != null ? await client.GetPreSignedURLAsync(request) : null;

                urls.Add(url);
                }
                else
                {
                    urls.Add(null);
                }
            
            }
            var res = _lm.GetLessonMapper(lessons , urls);

            return res;
        }  

        public async Task<GetLessonDetailsDTO> GetLessonByID(int id , string userid)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new GetLessonDetailsDTO{title = "err" , notes = "Invalid User ID."};

            var role = await _manager.GetRolesAsync(user);

            var lesson = await _repo.GetLessonWithFilesById(id);

            if(lesson == null) return new GetLessonDetailsDTO{title = "err" , notes = "Invalid Lesson ID."};
            
            if(role[0] == "student")
            {
                if(lesson.Division != user.Division || lesson.Faculty != user.Faculty || lesson.Year != user.Year) return new GetLessonDetailsDTO{title = "err" , notes = "You Are Not Authorized To See That , Stop Messing Around."};
            }

            var client = _s3.CreateClient();

                var URLs = new List<string>();

                if(lesson.filesdetails != null)
            {
                

                foreach(var i in lesson.filesdetails)
                {

                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = _config["BucketName"],
                        Verb = Amazon.S3.HttpVerb.GET,
                        Expires = DateTime.UtcNow.AddMinutes(3),
                        Key  = i.key
                    };

                    var result = await client.GetPreSignedURLAsync(request);
                    URLs.Add(result);
                }

            }
            return new GetLessonDetailsDTO {Division = lesson.Division , Faculty = lesson.Faculty , semester = lesson.semester , Subject = lesson.Subject , Type  = lesson.Type , UploadContentType = lesson.UploadContentType ,link = lesson.Link , text = lesson.Text, id = lesson.Id , title = lesson.Title , notes = lesson.Notes , uploadername = lesson.UploaderName! , filesurls = URLs , iscreator = lesson.UploaderId == user.Id , Year = lesson.Year};
        }

        public async Task<Edit_GetLessonDetailsDTO> GetLessonByID_Edit (int id , string userid)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new Edit_GetLessonDetailsDTO{title = "err" , notes = "Invalid User ID."};

            var role = await _manager.GetRolesAsync(user);

            var lesson = await _repo.GetLessonWithFilesById(id);

            if(lesson == null) return new Edit_GetLessonDetailsDTO{title = "err" , notes = "Invalid Lesson ID."};
            
            if(role[0] != "admin")
            {
                if(lesson.UploaderId != userid) return new Edit_GetLessonDetailsDTO{title = "err" , notes = "You Are Not Authorized To See That , Stop Messing Around."};
            }

            var Files_To_Return = new List<files> ();

            if(lesson.filesdetails != null && lesson.filesdetails.Count > 0)
            {
                foreach(var i in lesson.filesdetails)
                {
                    var file = new files
                    {
                        content_type = i.content_type,
                        filename = i.filename,
                        size = i.size
                        ,key = i.key
                    };
                    Files_To_Return.Add(file);
                }
            }

            return new Edit_GetLessonDetailsDTO
            {
                Division = lesson.Division , 
                Faculty = lesson.Faculty,
                files = Files_To_Return.Any() ? Files_To_Return : null,
                id = lesson.Id,
                link = lesson.Link,
                notes = lesson.Notes,
                semester = lesson.semester,
                Subject = lesson.Subject,
                text = lesson.Text,
                title = lesson.Title,
                Type= lesson.Type,
                UploadContentType = lesson.UploadContentType,
                Year = lesson.Year
            };
        }
    }
}