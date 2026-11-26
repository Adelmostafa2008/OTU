using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using backend.Service;
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
        public string ?Link {get;set;}
        public string ?Text {get;set;}
        public string ?Type {get;set;} 
        public string ? UploadContentType {get;set;} 
    }

    public class Lessons : GeneralUploads
    {
        public DateTime UploadDate {get;set;} 
        public IList<Lessonfiles> ?filesdetails{get;set;}
    }

    public class Quizzes : GeneralUploads
    {
        public IList<Quizfiles> ?filesdetails{get;set;}
        public DateTime QuizDate {get;set;} 
    }

    public class OnlineMeetings : GeneralUploads
    {
        
        public DateTime OnlineMeetingDate {get;set;} 
    }

    public class Assignments : GeneralUploads
    {
        public IList<Assignmentfiles> ?filesdetails{get;set;}
        public DateTime Deadline {get;set;}
    }
}