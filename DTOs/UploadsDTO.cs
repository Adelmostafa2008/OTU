using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class GeneralUploadDTO
    {
        public string Faculty {get;set;}
        public string Division {get;set;}
        public string Subject {get;set;}
        public int Year {get;set;}
        public string semester {get;set;}
        public string ? Notes {get;set;}
        public string Title {get;set;}
    }
    public class UploadDTO : GeneralUploadDTO
    {
        public string Link {get;set;}
        
    }
    public class EditUpDTO : UploadDTO {}


    public class QuizzUploadDTO : GeneralUploadDTO
    {
        public DateTime QuizDate {get;set;} 
    }

    public class QuizzEditDTO : QuizzUploadDTO {}


    public class OnlineMeetUploadDTO : GeneralUploadDTO
    {
         public DateTime OnlineMeetingDate {get;set;} 
    }

    public class OnlineMeetEditDTO : OnlineMeetUploadDTO {}

    public class UploadSearch
    {
        public string ?title {get;set;}
    }

    public class UploadSort
    {
        public string? Faculty {get;set;}
        public string? Division {get;set;}
        public string? Subject {get;set;}
        public int? Year {get;set;}
        public string? semester {get;set;}
        public DateTime UploadDate {get;set;}  = new DateTime(2001/9/11);
    }
}

