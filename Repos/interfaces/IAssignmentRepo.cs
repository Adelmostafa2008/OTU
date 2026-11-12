using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Repos.interfaces
{
    public interface IAssignmentRepo : IGenericRepo<Assignments>
    {
        Task<IList<Assignments>> GetAllAssignments(UploadSort sort , bool IsCard , int pagenum);
        Task<Assignments> GetAssignment(UploadSort sort , int id);
    }
}