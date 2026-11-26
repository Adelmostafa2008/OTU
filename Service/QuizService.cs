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
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace backend.Service
{
    public class QuizService
    {
        private readonly IQuizzesRepo _repo;
        private readonly UserManager<User> _manager;
        private readonly IFilebaseClient _s3;
        private readonly IConfiguration _config;
        private readonly AppDb appDb;

        public QuizService(AppDb app1 , IQuizzesRepo qr ,IConfiguration configuration,IFilebaseClient s3 ,UserManager<User> ur)
        {
            appDb = app1;
            _config = configuration;
            _s3 = s3;
            _manager = ur;
            _repo = qr;
        }

        public async Task<result> EditQuiz(int id ,QuizEditDTO newquiz)
        {
            var quiz = await _repo.GetById(id);

            if(quiz == null) return new result{flag = false , msg = "Invalid Quiz ID."};

            QuizMapper mapper = new QuizMapper{};

            mapper.editquizmapper(newquiz , quiz);

            await _repo.Save();

            return new result{flag = true , msg = "Quiz Edited Successfully."};
        }

        public async Task<GetQuizDetailsDTO> HandelSingleQuizFetch(string user_id , int quiz_id)
        {
            var user = await _manager.FindByIdAsync(user_id);

            if(user == null) return new GetQuizDetailsDTO {flag = false , msg = "Inavlid User ID."};

            var role = await _manager.GetRolesAsync(user);

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var quiz  = await _repo.GetSingleQuiz(quiz_id , sort);

            if(quiz == null) return new GetQuizDetailsDTO {flag = false , msg = "Inavlid Quiz ID."};

            var client = _s3.CreateClient();

            var urls = new List<string>();

            if(quiz.filesdetails != null && quiz.filesdetails.Count > 0)
            {   
                foreach(var i in quiz.filesdetails)
                {
                    var request = new GetPreSignedUrlRequest
                    {
                        BucketName = _config["BucketName"],
                        Key = i.key,
                        Verb = Amazon.S3.HttpVerb.GET,
                        Expires = DateTime.UtcNow.AddMinutes(3)
                    };

                    var result = await client.GetPreSignedURLAsync(request);

                    urls.Add(result);
                }

            }
            QuizMapper mapper = new QuizMapper();
            GetQuizDetailsDTO getQuiz  = mapper.GetQuizDetailsMapper(quiz , urls , user_id , role[0]);

            return getQuiz;

        }

        public async Task<GetQuizDetailsDTO_Edit> GetQuizDetailsForEdit(int quizid , string userid)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new GetQuizDetailsDTO_Edit{flag = false , msg = "Invalid User ID."};

            var quiz = await _repo.GetSingleQuiz(quizid);

            if(quiz == null) return new GetQuizDetailsDTO_Edit {flag = false , msg = "Invalid Quiz ID."};

            var role = await _manager.GetRolesAsync(user);

            if(role[0] != "admin")
            {
                if(quiz.Uploader!.Id != userid) return new GetQuizDetailsDTO_Edit {flag = false , msg = "You Are Not Authorized To Make Changes."};
            }

            var FILES_TO_MAP = new List<files>();

            if(quiz.filesdetails != null && quiz.filesdetails.Count > 0)
            {
                foreach(var i in quiz.filesdetails)
                {
                    var file = new files
                    {
                        content_type = i.content_type,
                        filename = i.filename,
                        key = i.key,
                        size = i.size
                    };

                    FILES_TO_MAP.Add(file);
                }
            }

            QuizMapper mapper = new QuizMapper();

            var result = mapper.GetQuizDetailsMapper_Edit(quiz , FILES_TO_MAP);

            return result;
        }
            // get for quiz edit , doc preveiw in frontend 

        public async Task<File_Upload_Result> UploadQuiz(QuizUploadDTO quiz)
        {
            var user = await _manager.FindByIdAsync(quiz.userid!);

            if(user == null) return new File_Upload_Result{flag = false , msg = "Invalid Uploader ID."};

            QuizMapper mapper = new QuizMapper{};

            if(quiz.UploadContentType == "link" || quiz.UploadContentType == "text")
            {
            var new_quiz = mapper.NormalUploadQuizMapper(quiz , user);
            await _repo.Create(new_quiz);
            return new File_Upload_Result{flag = true , msg = "Quiz Uploaded Successfully."};
            }

            var client = _s3.CreateClient();
            FileUploadService uploadService = new FileUploadService(_config , _s3);  
            var urls = new List<string>();
            Structure structure = new Structure
            {
                Division = quiz.Division,
                Faculty = quiz.Faculty,
                subject = quiz.Subject,
                type = "Quiz"
            };
            var files = new List<Quizfiles>();
            var content_types = new List<string>();
            foreach(var i in quiz.docs!)
            {
                var customKey = uploadService.UniqueObjectKey(i.filename , structure);
                var request = new GetPreSignedUrlRequest
                {
                    BucketName  = _config["BucketName"],
                    ContentType = i.content_type,
                    Expires = DateTime.UtcNow.AddMinutes(3),
                    Key = customKey,
                    Verb = Amazon.S3.HttpVerb.PUT
                };

                var newfile = new Quizfiles
                {
                    content_type = i.content_type,
                    filename = i.filename,
                    key = customKey,
                    size = i.size
                };

                var url = await client.GetPreSignedURLAsync(request);
                urls.Add(url);
                files.Add(newfile);
                content_types.Add(i.content_type);
            }
            var newquiz = mapper.UploadQuizWithDocsMapper(quiz , user , files);
            await _repo.Create(newquiz);

            var headers_values = new List<Url_Type>();

                for(int i = 0 ; i < urls.Count  ; i++)
                {
                    var HV = new Url_Type
                    {
                        contenttype = content_types[i],
                        url = urls[i]
                    };

                    headers_values.Add(HV);
                }

                return new File_Upload_Result {flag = true , headers = headers_values , msg = "Upload docs"};
        }

        public async Task<result> DeleteQuiz(int id)
        {
            var quiz = await _repo.GetSingleQuiz(id);

            if(quiz == null) return new result{flag = false , msg = "Invalid Quiz ID."};

            if(quiz.filesdetails == null || quiz.filesdetails.Count == 0)
            {
                await _repo.Delete(quiz);
                return new result{flag = true , msg = "Quiz Deleted Successfully."};
            }

            var client = _s3.CreateClient();

            var keys = quiz.filesdetails.Select(x => x.key).ToList();

            var keyversions = new List<KeyVersion>();

            foreach(var i in keys)
            {
                var keyversion = new KeyVersion
                {
                    Key = i
                };

                keyversions.Add(keyversion);
            }

            var request = new DeleteObjectsRequest
            {
                BucketName = _config["BucketName"],
                Objects = keyversions
            };

            await client.DeleteObjectsAsync(request);

            await _repo.Delete(quiz);

            return new result{flag = true , msg = "Quiz Deleted Successfully."};
        }

        public async Task<result> Edit_DeleteFiles(int id , IList<string> keys)
        {
            var quiz = await _repo.GetSingleQuiz(id);

            if(quiz == null) return new result{flag = false , msg = "Invalid Quiz ID."};

            if(!keys.Any() || keys.Count == 0) return new result {flag = false , msg = "No Keys Provided."};

            if(quiz.filesdetails == null || quiz.filesdetails.Count == 0) return new result{flag = false , msg = "No Document/s To Delete."};

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

            List<Quizfiles> FilesToDelete = [.. quiz.filesdetails.Where(x => ExecludeSet.Contains(x.key!))];

            await client.DeleteObjectsAsync(deleterequest);

            GenericRepo<Quizfiles> genericRepo = new GenericRepo<Quizfiles>(appDb);
            
            await genericRepo.DeleteChunk(FilesToDelete);

            await _repo.Save();
            return new result {flag = true , msg = "Document/s Deleted Successfully"};
        }

        public async Task<File_Upload_Result> Edit_AddFiles(int id , QuizEditDTO files)
        {
             var quiz = await _repo.GetSingleQuiz(id);

            if(quiz == null) return new File_Upload_Result{flag = false , msg = "Invalid Quiz ID."};

            if(!files.docs!.Any() || files.docs!.Count == 0) return new File_Upload_Result {flag = false , msg = "No Documents Provided."};

            var client = _s3.CreateClient();
                FileUploadService _service = new FileUploadService(_config , _s3);
                Structure structure = new Structure
                {
                    Division = files.Division,
                    Faculty = files.Faculty,
                    type = files.Type,
                    subject = files.Subject
                };
                var URLs = new List<string>();
                var content_types = new List<string>();
                var newtoadddocs = new List<Quizfiles>();

                foreach(var i in files.docs)
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
                    var file = new Quizfiles
                    {
                        size = i.size,
                        content_type = i.content_type,
                        filename = i.filename , 
                        key = customkey,
                        QuizID = quiz.Id
                    };
                    newtoadddocs.Add(file);
                    if(file != null)
                    {
                        if(quiz.filesdetails == null)
                        {
                            quiz.filesdetails = newtoadddocs;
                        }
                        else
                        {
                            quiz.filesdetails.Add(file);
                        } 
                    } 
                }
                quiz.Link = null;
                quiz.Text = null;
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
    }
}