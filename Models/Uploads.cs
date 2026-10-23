using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    public class GeneralUploads
    {
        public string Title {get;set;}
        public string Faculty {get;set;}
        public string Division {get;set;}
        public string Subject {get;set;}
        public int Year {get;set;}
        public string ? semester {get;set;}
        public string ? Notes {get;set;}
        
    }

    public class Lessons : GeneralUploads
    {
        [Key]
        public int Id {get;set;}
        public string Link {get;set;}
        public DateTime UploadDate {get;set;} 
    }

    public class Quizzes : GeneralUploads
    {
        [Key]
        public int Id {get;set;}
        public DateTime QuizDate {get;set;} 
    }

    public class OnlineMeetings : GeneralUploads
    {
        [Key]
        public int Id {get;set;}
        public DateTime OnlineMeetingDate {get;set;} 
    }
}