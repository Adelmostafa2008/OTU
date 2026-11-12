using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    public class GeneralUploads
    {
        [Key]
        public int Id {get;set;}
        [MaxLength(105)]
        public string Title {get;set;}
        public string Faculty {get;set;}
        public string Division {get;set;}
        public string Subject {get;set;}
        public int Year {get;set;}
        public string ? semester {get;set;}
        [MaxLength(405)]
        public string ? Notes {get;set;}
        [ForeignKey("UploaderId")]
        public string ?UploaderId {get;set;}
        public User ?Uploader {get;set;} 
        public string ?UploaderName {get;set;}
    }

    public class Lessons : GeneralUploads
    {
        
        public string Link {get;set;}
        public DateTime UploadDate {get;set;} 
        public string Type {get;set;}
    }

    public class Quizzes : GeneralUploads
    {
       
        public DateTime QuizDate {get;set;} 
    }

    public class OnlineMeetings : GeneralUploads
    {
        
        public DateTime OnlineMeetingDate {get;set;} 
    }

    public class Assignments : GeneralUploads
    {
        public DateTime Deadline {get;set;}
    }
}