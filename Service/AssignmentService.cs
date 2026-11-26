using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Threading.Tasks;
using Amazon.S3.Model;
using backend.data;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
using backend.Repos;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;

namespace backend.Service
{
    public class Assignment_result
    {
        public string ?faculty {get;set;}
        public string ?division {get;set;}
        public string ?subject {get;set;}
        public int ?year {get;set;}
        public string ?semester {get;set;}
        public string ? notes {get;set;}
        public string ?title {get;set;}
        public DateTime ?deadline {get;set;}
        public bool ?flag {get;set;}
        public int id {get;set;}
        public string ?msg {get;set;}
        public string ?uploadername {get;set;}
        public bool iscreator {get;set;}
    }
    public class AssignmentResultWithDocs
    {
        public string ?title {get;set;}
        public string ?uploadername {get;set;}
        public string ?link {get;set;}
        public string ?text {get;set;}
        public string ? notes {get;set;}
        public IList<string> ? filesurls{get;set;}
        public bool ?iscreator {get;set;} = false;
        public int ?id {get;set;}
        public string ?faculty {get;set;}
        public string ?division {get;set;}
        public string ?subject {get;set;}
        public int? year {get;set;}
        public string ?semester {get;set;}
        public string ? UploadContentType {get;set;}
        public DateTime? deadline {get;set;}
        public bool flag {get;set;}
        public string ?msg {get;set;}
        public IList<files> ?files {get;set;}

    }
    public class AssignmentService
    {
        private readonly UserManager<User> _manager;
        private readonly IAssignmentRepo _repo;
        private readonly IFilebaseClient _s3;
        private readonly IConfiguration _config;
        private readonly AppDb appDb;
        public AssignmentService(UserManager<User> manager , AppDb db,IConfiguration configuration , IFilebaseClient s3 , IAssignmentRepo repo)
        {
            appDb = db;
            _config = configuration;
            _s3 = s3;
            _repo = repo;
            _manager = manager;
        }

        public async Task<File_Upload_Result> createNewAssignment(string userid , AssignmentUpload assignment)
        {
            var user = await _manager.FindByIdAsync(assignment.userid!);

            if(user == null) return new File_Upload_Result{flag = false , msg = "Invalid Uploader ID."};

            AssignmentMapper mapper = new AssignmentMapper{};

            if(assignment.UploadContentType == "link" || assignment.UploadContentType == "text")
            {
            var new_assignment = mapper.mapAssignmentCreation(assignment , user);
            await _repo.Create(new_assignment);
            return new File_Upload_Result{flag = true , msg = "Quiz Uploaded Successfully."};
            }

            var client = _s3.CreateClient();
            FileUploadService uploadService = new FileUploadService(_config , _s3);  
            var urls = new List<string>();
            Structure structure = new Structure
            {
                Division = assignment.Division,
                Faculty = assignment.Faculty,
                subject = assignment.Subject,
                type = "Assignment"
            };
            var files = new List<Assignmentfiles>();
            var content_types = new List<string>();
            foreach(var i in assignment.docs!)
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

                var newfile = new Assignmentfiles
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
            var newquiz = mapper.mapAssignmentWithDocsCreation(assignment , user , files);
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

        public async Task<result> deleteAssignment(int assignmentId)
        {
            UploadSort sort = new UploadSort();
            var assignment = await _repo.GetAssignment(sort,assignmentId);

            if(assignment == null) return new result {flag = false , msg = "Invalid Assignment ID."};
            if(assignment.UploadContentType == "link" || assignment.UploadContentType == "text")
            {
                await _repo.Delete(assignment);
            }
            else
            {
                if(assignment.filesdetails != null)
                {
                    
                var client = _s3.CreateClient();
                var keys = new List<KeyVersion>();

                foreach(var i in assignment.filesdetails!)
                {
                    var key = new KeyVersion
                    {
                        Key = i.key
                    };
                    keys.Add(key);
                }

                var request = new DeleteObjectsRequest
                {
                    BucketName = _config["BucketName"],
                    Objects = keys,
                };

                await client.DeleteObjectsAsync(request);
                }
                await _repo.Delete(assignment);
            } 

            return new result {flag = true ,msg = "Assignment Deleted Successfully."};
        }

        public async Task<result> EditAssignment_TXTValues(int assId , AssignmentEdit newAssignment)
        {
            var old_assignment = await _repo.GetById(assId);

            if(old_assignment == null) return new result {flag = false , msg = "Invalid Assignment ID."};

            AssignmentMapper mapper = new AssignmentMapper{};

            mapper.mapAssignmentEdit(old_assignment , newAssignment);

            await _repo.Save();

            return new result{flag = true , msg = "Assignment Edited Successfully."};
        }

        public async Task<File_Upload_Result> EditAssignment_AddFiles(int AssignmentID , AssignmentEdit newfiles)
        {
            if(newfiles.docs == null || newfiles.docs.Count == 0) return new File_Upload_Result{flag = false , msg = "No Files Provided."};

            var assignment = await _repo.GetAssignment(null , AssignmentID);

            if(assignment == null) return new File_Upload_Result{flag = false , msg = "Invalid Assignment ID."};

            var client = _s3.CreateClient();

            Structure structure = new Structure
            {
                Division = assignment.Division,
                Faculty = assignment.Faculty,
                subject = assignment.Subject,
                type = "Assignment"
            };
            FileUploadService fileUploadService = new FileUploadService(_config , _s3);
            var urls = new List<string>();
            var contentTypes = new List<string>();
            foreach(var i in newfiles.docs)
            {
                var customKey  = fileUploadService.UniqueObjectKey(i.filename,structure);
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = _config["BucketName"],
                    ContentType = i.content_type,
                    Expires = DateTime.UtcNow.AddMinutes(5),
                    Key = customKey,
                    Verb = Amazon.S3.HttpVerb.PUT
                };
                var url = await client.GetPreSignedURLAsync(request);
                var newAssignmentFile = new Assignmentfiles
                {
                    size = i.size,
                    assignment = assignment,
                    AssignmentID = assignment.Id,
                    content_type = i.content_type,
                    filename = i.filename,
                    key = customKey  
                };

                assignment.filesdetails!.Add(newAssignmentFile);
                urls.Add(url);
                contentTypes.Add(i.content_type);
            }
            var Headers_To_Return = new List<Url_Type>();
            for(int i = 0 ; i < urls.Count ; i++)
            {
                var header = new Url_Type
                {
                    contenttype = contentTypes[i],
                    url = urls[i]
                };
                Headers_To_Return.Add(header);
            }
            await _repo.Save();
            return new File_Upload_Result{flag = true , msg = "File/s Uploaded Successfully." , headers = Headers_To_Return};

        }

        public async Task<result> EditAssignment_DeleteFiles(int assignmentId , IList<string> keys)
        {
            if(keys.Count == 0) return new result{flag = false , msg = "There Are No Keys Provided."};

            var assignment = await _repo.GetAssignment(null,assignmentId);

            if(assignment == null) return new result {flag = false ,  msg = "Invalid Assignment ID."};

            if(assignment.filesdetails == null || assignment.filesdetails.Count == 0) return new result{flag = false , msg = "Assignment : There Is No Assigned File/s To Delete."};

            var ExecludeSet = new HashSet<string>(keys , StringComparer.OrdinalIgnoreCase);

            List<Assignmentfiles> FilesToDelete = [.. assignment.filesdetails.Where(x => ExecludeSet.Contains(x.key!))];

            GenericRepo<Assignmentfiles> AssignmentService = new GenericRepo<Assignmentfiles>(appDb);

            await AssignmentService.DeleteChunk(FilesToDelete);

            var client = _s3.CreateClient();
            var keystodelete = new List<KeyVersion>();
            foreach(var i in keys)
            {
                var key = new KeyVersion
                {
                    Key = i
                };

                keystodelete.Add(key);
            }
            var request = new DeleteObjectsRequest
            {
                BucketName = _config["BucketName"],
                Objects = keystodelete
            };

            

            await client.DeleteObjectsAsync(request);

            await _repo.Save();

            return new result{flag = true , msg = "File/s Deleted Successfully."};
        }

        public async Task<IList<Assignment_result>>  GetAllAssignments(string user_id , bool IsCard , int pagenum)
        {
            var user = await _manager.FindByIdAsync(user_id);

            if(user == null) return [new Assignment_result {flag =false , msg = "Invalid User ID."}];

            UploadSort sort = new UploadSort
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year
            };

            var assignments = await _repo.GetAllAssignments(sort , IsCard , pagenum);

            if(!assignments.Any() || assignments.Count == 0) return [new Assignment_result{flag = false , msg = "No Assignments Found."}];

            AssignmentMapper mapper = new AssignmentMapper{};

            IList<Assignment_result> result = mapper.GetAssignmentsMapper(assignments);

            return result;
        }

        public async Task<AssignmentResultWithDocs> GetAssignment_Edit(string userid , int assignment_id)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new AssignmentResultWithDocs {flag =false , msg = "Invalid User ID."};

            var role = await _manager.GetRolesAsync(user);

            UploadSort sort = new UploadSort
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year
            };

            var assignment = await _repo.GetAssignment(sort , assignment_id);

            if(assignment == null) return new AssignmentResultWithDocs{flag = false , msg = "No Assignment Found."};

            AssignmentMapper mapper = new AssignmentMapper{};

            string user_id = user.Id;

            if(role[0] == "admin")
            {
                user_id = "admin";
            }

            var Files_To_Return = new List<files>();

            if(assignment.filesdetails != null)
            {
                foreach(var i in assignment.filesdetails)
                {
                    var file = new files
                    {
                        content_type = i.content_type,
                        filename = i.filename,
                        key = i.key,
                        size = i.size
                    };
                    Files_To_Return.Add(file);

                    
                }
            } // make another get mapper for the edit page

            AssignmentResultWithDocs result = mapper.GetAssignmentMapper_Edit(assignment , user_id , Files_To_Return);

            return result;
        }

        public async Task<AssignmentResultWithDocs> GetAssignment(string userid , int assignment_id)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new AssignmentResultWithDocs {flag =false , msg = "Invalid User ID."};

            var role = await _manager.GetRolesAsync(user);

            UploadSort sort = new UploadSort
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year
            };

            var assignment = await _repo.GetAssignment(sort , assignment_id);

            if(assignment == null) return new AssignmentResultWithDocs{flag = false , msg = "No Assignment Found."};

            AssignmentMapper mapper = new AssignmentMapper{};

            string user_id = user.Id;

            if(role[0] == "admin")
            {
                user_id = "admin";
            }

            var filesUrls = new List<string>();

            if(assignment.filesdetails != null)
            {
                var client = _s3.CreateClient();

                foreach(var i in assignment.filesdetails)
                {
                    var request = new GetPreSignedUrlRequest
                    {
                       BucketName = _config["BucketName"],
                       Expires = DateTime.UtcNow.AddMinutes(3),
                       Key = i.key,
                       Verb = Amazon.S3.HttpVerb.GET  
                    };

                    var url = await client.GetPreSignedURLAsync(request);

                    filesUrls.Add(url);
                }
            } 

            AssignmentResultWithDocs result = mapper.GetAssignmentMapper(assignment , user_id , filesUrls);

            return result;
        }
    }
}