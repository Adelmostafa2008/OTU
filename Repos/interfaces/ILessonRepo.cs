using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Repos.interfaces
{
    public interface ILessonRepo : IGenericRepo<Lessons>
    {
        Task<IList<Lessons>> GetAllUploads(UploadSearch search , UploadSort sort , int pageNum);
    }
}