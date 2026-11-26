using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.S3.Model;
using backend.data;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
using backend.Repos;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Identity;

namespace backend.Service
{
    public class File_Upload_Result : result
    {
        public List<Url_Type> ? headers {get;set;}
    }
    public class Url_Type
    {
        public string ?url {get;set;}
        public string ?contenttype {get;set;}
    }
    public class LessonService
    {
        private readonly UserManager<User> _manager;
        private readonly ILessonRepo _repo;
        private readonly IConfiguration _config;
        private readonly IFilebaseClient _s3;
        private readonly AppDb appDb;

        public LessonService(UserManager<User> manager , AppDb app1,IFilebaseClient s3, IConfiguration config , ILessonRepo repo)
        {
            appDb = app1;
            _s3 = s3;
            _config = config;
            _repo = repo;
            _manager = manager;
        }
        public async Task<File_Upload_Result> Edit_UploadFiles(UploadAndEditDTO lesson , int id)
        {
            var les = await _repo.GetById(id);
            if(les != null)
            {
                if(lesson.docs == null || lesson.docs.Count == 0) return new File_Upload_Result{flag = false , msg = "No documents provided."};

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
                var newtoadddocs = new List<Lessonfiles>();

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
                    var file = new Lessonfiles
                    {
                        size = i.size,
                        content_type = i.content_type,
                        filename = i.filename , 
                        key = customkey,
                        LessonID = les.Id
                    };
                    newtoadddocs.Add(file);
                    if(file != null)
                    {
                        if(les.filesdetails == null)
                        {
                            les.filesdetails = newtoadddocs;
                        }
                        else
                        {
                            les.filesdetails.Add(file);
                        } 
                    } 
                }
                les.Link = null;
                les.Text = null;
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
                await _repo.Save();

                return new File_Upload_Result {flag = true , headers = headers_values , msg = "Upload docs"};
                
            }
            else
            {
                return new File_Upload_Result{flag = false , msg = "Invalid Lesson ID."};
            }
        }
        public async Task<File_Upload_Result> UploadLesson(UploadAndEditDTO lesson )
        {
            var user = await _manager.FindByIdAsync(lesson.userid!);

            if(user == null) return new File_Upload_Result {flag = false , msg = "Invalid User ID."};

            LessonsMapper mapper = new LessonsMapper();

            if(lesson.UploadContentType == "link" || lesson.UploadContentType == "text")
            {
                var new_lesson = mapper.NormalUploadLessonMapper(lesson , user);

                await _repo.Create(new_lesson);

            } 
            else if(lesson.UploadContentType == "documents")
            {
                if(lesson.docs == null  || lesson.docs.Count == 0) return new File_Upload_Result{flag = false , msg = "No documents provided."};


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
                var files = new List<Lessonfiles>();

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
                    var file = new Lessonfiles
                    {
                        size = i.size,
                        content_type = i.content_type,
                        filename = i.filename , 
                        key = customkey,
                    };
                    files.Add(file);
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

                return new File_Upload_Result {flag = true , headers = headers_values , msg = "Upload docs"};

            }
            else
            {
                return new File_Upload_Result{flag = false , msg = "Invalid Content Type."};
            }

            return new File_Upload_Result{flag = true , msg = "Lesson Uploaded Successfully."};
            
        }

        public async Task<result> Edit_DeleteFiles(int id , IList<string> keys)
        {
            var lesson = await _repo.GetLessonWithFilesById(id);
            if(lesson == null) return new result {flag = false , msg = "Invalid Lesson ID."};

            if(!keys.Any() || keys.Count == 0) return new result {flag = false , msg = "No Keys Provided."};

            if(lesson.filesdetails == null || lesson.filesdetails.Count == 0) return new result {flag = false , msg = "No Files To Delete."};

            var client = _s3.CreateClient();

            var listofkeys = keys.Select((x) =>
                new KeyVersion
                {
                    Key = x
                }
            ).ToList();

           
            var deleterequest = new DeleteObjectsRequest
            {
                BucketName = _config["BucketName"],
                Objects = listofkeys
            };

            var ExecludeSet = new HashSet<string>(keys , StringComparer.OrdinalIgnoreCase);

            List<Lessonfiles> FilesToDelete = [.. lesson.filesdetails.Where(x => ExecludeSet.Contains(x.key!))];

            await client.DeleteObjectsAsync(deleterequest);

            GenericRepo<Lessonfiles> genericRepo = new GenericRepo<Lessonfiles>(appDb);
            
            await genericRepo.DeleteChunk(FilesToDelete);

            await _repo.Save();
            return new result {flag = true , msg = "File/s Deleted Successfully"};
        }
        public async Task<result> DeleteLesson(int id)
        {
            var lesson = await _repo.GetById(id);

            if(lesson == null) return new result{flag = false , msg = "Invalid Lesson ID."};

            var client = _s3.CreateClient();

            if(lesson.filesdetails == null || lesson.filesdetails.Count == 0)
            {
                await _repo.Delete(lesson);
                return new result{flag = true , msg = "Lesson Deleted Successfully."};
            }

            var keys = new List<KeyVersion>();

            foreach(var dockey in lesson.filesdetails)
            {
                var item = new KeyVersion
                {
                    Key = dockey.key
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