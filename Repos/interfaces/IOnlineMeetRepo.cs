using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Repos.interfaces
{
    public interface IOnlineMeetRepo : IGenericRepo<OnlineMeetings>
    {
        Task<IList<OnlineMeetings>> GetAllMeetsWithStudentSort(UploadSort sort);
        Task<OnlineMeetings> GetSingleOnlineMeeting(UploadSort sort , int meet_id);
    }
}