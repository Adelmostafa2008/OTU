using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.data;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Repos
{
    public class AssignmentRepo : GenericRepo<Assignments>, IAssignmentRepo
    {
        public AssignmentRepo(AppDb _db) : base(_db)
        {
            
        }

        public async Task<IList<Assignments>> GetAllAssignments(UploadSort sort , bool IsCard , int pageNum)
        {
            var assignments = _db.assignments.AsQueryable();

             if (!string.IsNullOrEmpty(sort.Division))
            {
                assignments = assignments.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort.Faculty))
            {
                assignments = assignments.Where(x => x.Faculty == sort.Faculty);
            }if (sort.Year != null)
            {
                assignments = assignments.Where(x => x.Year == sort.Year);
            }

            if (IsCard)
            {
                assignments = assignments.Take(6);
            }
            else
            {
                assignments = assignments.Skip((pageNum - 1) * 12).Take(12);
            }


            return await assignments.ToListAsync();
        }

        public async Task<Assignments> GetAssignment(UploadSort ?sort, int id)
        {
            var assignment =  _db.assignments.Include(x => x.Uploader).Include(x => x.filesdetails).AsQueryable();
            if(sort != null)
            {
                
             if (!string.IsNullOrEmpty(sort?.Division))
            {
                assignment = assignment.Where(x => x.Division == sort.Division);
            }
            if (!string.IsNullOrEmpty(sort?.Faculty))
            {
                assignment = assignment.Where(x => x.Faculty == sort.Faculty);
            }if ( sort?.Year != null)
            {
                assignment = assignment.Where(x => x.Year == sort.Year);
            }
            }

            return await assignment.FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}