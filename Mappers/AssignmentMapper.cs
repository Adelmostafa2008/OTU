using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Service;

namespace backend.Mappers
{
    public class AssignmentMapper
    {
        public Assignments mapAssignmentCreation(AssignmentUpload assignment , User user)
        {
            return new Assignments
            {
                Deadline = assignment.deadline,
                Division = assignment.Division,
                Faculty = assignment.Faculty,
                Notes = assignment.Notes,
                semester = assignment.semester,
                Subject = assignment.Subject,
                Title = assignment.Title,
                Uploader = user,
                UploaderId = user.Id,
                Year = assignment.Year, 
                UploaderName = user.givenName
            };
        }

        public void mapAssignmentEdit(Assignments old_assignment , AssignmentEdit new_assignment)
        {
            if(!string.IsNullOrEmpty(new_assignment.Title) && new_assignment.Title != old_assignment.Title)
            {
                old_assignment.Title = new_assignment.Title;
            }
            if(!string.IsNullOrEmpty(new_assignment.Faculty) && new_assignment.Faculty != old_assignment.Faculty)
            {
                old_assignment.Faculty = new_assignment.Faculty;
            }
            if(!string.IsNullOrEmpty(new_assignment.Division) && new_assignment.Division != old_assignment.Division)
            {
                old_assignment.Division = new_assignment.Division;
            }
            if(!string.IsNullOrEmpty(new_assignment.Subject) && new_assignment.Subject != old_assignment.Subject)
            {
                old_assignment.Subject = new_assignment.Subject;
            }
            if(new_assignment.Year != old_assignment.Year)
            {
                old_assignment.Year = new_assignment.Year;
            }
            if(!string.IsNullOrEmpty(new_assignment?.semester) && new_assignment.semester != old_assignment.semester)
            {
                old_assignment.semester = new_assignment.semester;
            }
            if( new_assignment?.Notes != old_assignment.Notes)
            {
                old_assignment.Notes = new_assignment?.Notes;
            }
            if(new_assignment?.deadline != null && new_assignment.deadline != old_assignment.Deadline)
            {
                old_assignment.Deadline = new_assignment.deadline;
            }
        }

        public IList<Assignment_result> GetAssignmentsMapper(IList<Assignments> assignments)
        {
            IList<Assignment_result> result = [];

            foreach(var i in assignments)
            {
                var new_assignment_result = new Assignment_result
                {
                    deadline = i.Deadline,
                    division = i.Division,
                    faculty = i.Faculty,
                    flag = true,
                    msg = "",
                    notes = i.Notes,
                    semester = i.semester,
                    subject = i.Subject,
                    title = i.Title,
                    uploadername = i.UploaderName,
                    year = i.Year
                    ,id = i.Id
                };

                result.Add(new_assignment_result);
            }

            return result;
        }

        public Assignment_result GetAssignmentMapper(Assignments assignment , string userid)
        {
            return new Assignment_result
            {
                deadline = assignment.Deadline,
                division = assignment.Division,
                faculty = assignment.Faculty,
                notes = assignment.Notes,
                semester = assignment.semester,
                subject = assignment.Subject,
                title = assignment.Title,
                year = assignment.Year, 
                uploadername = assignment.UploaderName,
                flag = true,
                msg = "",
                id = assignment.Id,
                iscreator = userid != "admin" ? userid == assignment.Uploader!.Id : true
            };
        }
    }
    
}