using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
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
    public class AssignmentService
    {
        private readonly UserManager<User> _manager;
        private readonly IAssignmentRepo _repo;

        public AssignmentService(UserManager<User> manager , IAssignmentRepo repo)
        {
            _repo = repo;
            _manager = manager;
        }

        public async Task<result> createNewAssignment(string userid , AssignmentUpload assignment)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new result{flag = false , msg = "Invalid User ID."};

            AssignmentMapper mapper = new AssignmentMapper{};

            Assignments newAssignment = mapper.mapAssignmentCreation(assignment , user);

            await _repo.Create(newAssignment);

            return new result {flag = true , msg = "Assignment Created Successfully."};

        }

        public async Task<result> deleteAssignment(int assignmentId)
        {
            var assignment = await _repo.GetById(assignmentId);

            if(assignment == null) return new result {flag = false , msg = "Invalid Assignment ID."};

            await _repo.Delete(assignment);

            return new result {flag = true ,msg = "Assignment Deleted Successfully."};
        }

        public async Task<result> editAssignment(int assId , AssignmentEdit newAssignment)
        {
            var old_assignment = await _repo.GetById(assId);

            if(old_assignment == null) return new result {flag = false , msg = "Invalid Assignment ID."};

            AssignmentMapper mapper = new AssignmentMapper{};

            mapper.mapAssignmentEdit(old_assignment , newAssignment);

            await _repo.Save();

            return new result{flag = true , msg = "Assignment Edited Successfully."};
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

        public async Task<Assignment_result> GetAssignment(string userid , int assignment_id)
        {
            var user = await _manager.FindByIdAsync(userid);

            if(user == null) return new Assignment_result {flag =false , msg = "Invalid User ID."};

            var role = await _manager.GetRolesAsync(user);

            UploadSort sort = new UploadSort
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year
            };

            var assignment = await _repo.GetAssignment(sort , assignment_id);

            if(assignment == null) return new Assignment_result{flag = false , msg = "No Assignment Found."};

            AssignmentMapper mapper = new AssignmentMapper{};

            string user_id = user.Id;

            if(role[0] == "admin")
            {
                user_id = "admin";
            }

            Assignment_result result = mapper.GetAssignmentMapper(assignment , user_id);

            return result;
        }
    }
}