using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3.Model;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Identity;

namespace backend.Service
{
    public class Lesson_Service_Result
    {
        public bool flag {get;set;}
        public string ?msg {get;set;}
        public List<Url_Type> ? headers {get;set;}
    }
    public class Url_Type
    {
        public string url {get;set;}
        public string contenttype {get;set;}
    }
    public class LessonService
    {
        private readonly UserManager<User> _manager;
        private readonly ILessonRepo _repo;
        private readonly IConfiguration _config;
        private readonly IFilebaseClient _s3;

        public LessonService(UserManager<User> manager,IFilebaseClient s3, IConfiguration config , ILessonRepo repo)
        {
            _s3 = s3;
            _config = config;
            _repo = repo;
            _manager = manager;
        }
        public async Task<Lesson_Service_Result> Edit_UploadFiles(UploadAndEditDTO lesson , int id)
        {
            var les = await _repo.GetById(id);
            if(les != null)
            {
                if(!lesson.docs.Any()) return new Lesson_Service_Result{flag = false , msg = "No documents provided."};

                var client = _s3.CreateClient();
                FileUploadService _service = new FileUploadService(_config , _s3);
                Structure structure = new Structure
                {
                    Division = lesson.Division,
                    Faculty = lesson.Faculty,
                    type = lesson.Type,
                    subject = lesson.Subject
                };
                var URLs = new List<string>();
                var content_types = new List<string>();
                var files = new Dictionary<string , string>();

                foreach(var i in lesson.docs)
                {
                    var customkey = _service.UniqueObjectKey(i.filename , structure);

                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = _config["BucketName"],
                        Key = customkey,
                        ContentType = i.content_type,
                        Verb = Amazon.S3.HttpVerb.PUT,
                        Expires = DateTime.UtcNow.AddMinutes(5),
                    };

                    var result = await client.GetPreSignedURLAsync(request);
                    content_types.Add(i.content_type);
                    URLs.Add(result);
                    files.Add(i.filename , customkey);
                }

                var headers_values = new List<Url_Type>();

                for(int i = 0 ; i < URLs.Count  ; i++)
                {
                    var HV = new Url_Type
                    {
                        contenttype = content_types[i],
                        url = URLs[i]
                    };

                    headers_values.Add(HV);
                }
                
                les.files = files;

                await _repo.Save();

                return new Lesson_Service_Result {flag = true , headers = headers_values , msg = "Upload docs"};
                
            }
            else
            {
                return new Lesson_Service_Result{flag = false , msg = "Invalid Lesson ID."};
            }
        }
        public async Task<Lesson_Service_Result> UploadAndEditLesson(UploadAndEditDTO lesson )
        {
            var user = await _manager.FindByIdAsync(lesson.userid);

            if(user == null) return new Lesson_Service_Result {flag = false , msg = "Invalid User ID."};

            LessonsMapper mapper = new LessonsMapper{};

            if(lesson.UploadContentType == "link" || lesson.UploadContentType == "text")
            {
                var new_lesson = mapper.NormalUploadLessonMapper(lesson , user);

                await _repo.Create(new_lesson);

            } 
            else if(lesson.UploadContentType == "documents")
            {
                if(!lesson.docs.Any()) return new Lesson_Service_Result{flag = false , msg = "No documents provided."};


                var client = _s3.CreateClient();
                FileUploadService _service = new FileUploadService(_config , _s3);
                Structure structure = new Structure
                {
                    Division = lesson.Division,
                    Faculty = lesson.Faculty,
                    type = lesson.Type,
                    subject = lesson.Subject
                };
                var URLs = new List<string>();
                var content_types = new List<string>();
                var files = new Dictionary<string , string>();

                foreach(var i in lesson.docs)
                {
                    var customkey = _service.UniqueObjectKey(i.filename , structure);

                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = _config["BucketName"],
                        Key = customkey,
                        ContentType = i.content_type,
                        Verb = Amazon.S3.HttpVerb.PUT,
                        Expires = DateTime.UtcNow.AddMinutes(5),
                    };

                    var result = await client.GetPreSignedURLAsync(request);
                    content_types.Add(i.content_type);
                    URLs.Add(result);
                    files.Add(i.filename , customkey);
                }
                
                var newlesson = mapper.UploadLessonMapperWithDocuments(lesson , user , files);

                await _repo.Create(newlesson);

                var headers_values = new List<Url_Type>();

                for(int i = 0 ; i < URLs.Count  ; i++)
                {
                    var HV = new Url_Type
                    {
                        contenttype = content_types[i],
                        url = URLs[i]
                    };

                    headers_values.Add(HV);
                }

                return new Lesson_Service_Result {flag = true , headers = headers_values , msg = "Upload docs"};

            }
            else
            {
                return new Lesson_Service_Result{flag = false , msg = "Invalid Content Type."};
            }

            return new Lesson_Service_Result{flag = true , msg = "Lesson Uploaded Successfully."};
            
        }

        public async Task<result> Edit_DeleteFiles(int id , IList<string> keys)
        {
            var lesson = await _repo.GetById(id);
            if(lesson == null) return new result {flag = false , msg = "Invalid Lesson ID."};

            if(!keys.Any() || keys.Count == 0) return new result {flag = false , msg = "No Keys Provided."};

            if(!lesson.files.Any() || lesson.files.Count == 0) return new result {flag = false , msg = "No Files To Delete."};

            var client = _s3.CreateClient();

            var listofkeys = new List<KeyVersion>();

            foreach(var i in keys)
            {
                var key = new KeyVersion
                {
                    Key = i
                };

                listofkeys.Add(key);
            }
            
            var deleterequest = new DeleteObjectsRequest
            {
                BucketName = _config["BucketName"],
                Objects = listofkeys
            };

            var newfiles = new Dictionary<string , string>();

            var valuelist = lesson.files.Values.ToList();
            var keylist = lesson.files.Keys.ToList();

            for(int i = 0 ; i < keys.Count ; i++)
            {
                var IsExist = keys.Contains(valuelist[i]);

                if(IsExist) continue;

                newfiles.Add(keylist[i] , valuelist[i]);
            }

            await client.DeleteObjectsAsync(deleterequest);
            
            lesson.files = newfiles;

            await _repo.Save();
            return new result {flag = true , msg = "File/s Deleted Successfully"};
        }
        public async Task<result> DeleteLesson(int id)
        {
            var lesson = await _repo.GetById(id);

            if(lesson == null) return new result{flag = false , msg = "Invalid Lesson ID."};

            var client = _s3.CreateClient();

            if(lesson.files == null || lesson.files.Count == 0)
            {
                await _repo.Delete(lesson);
                return new result{flag = true , msg = "Lesson Deleted Successfully."};
            }

            var keys = new List<KeyVersion>();

            foreach(var dockey in lesson.files)
            {
                var item = new KeyVersion
                {
                    Key = dockey.Value
                };

                keys.Add(item);
            }

            var deleterequest = new DeleteObjectsRequest
            {
                BucketName = _config["BucketName"],
                Objects = keys
            };

            await client.DeleteObjectsAsync(deleterequest);

            await _repo.Delete(lesson);

            return new result {flag = true , msg = "Lesson Deleted Successfully."};
            
        }

        public async Task<result> EditLesson(UploadAndEditDTO newlesson , int id)
        {
            var lesson = await _repo.GetById(id);

            if(lesson == null) return new result{flag = false , msg = "Invalid Lesson ID."};

            LessonsMapper mapper = new LessonsMapper();

            mapper.EditLessonMapper(newlesson , lesson);

            await _repo.Save();

            return new result{flag = true , msg = "Lesson Edited Successfully."};
        }
    }
}