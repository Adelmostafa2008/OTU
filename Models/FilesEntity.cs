using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Service;

namespace backend.Models;

public class Lessonfiles : files
{
    [Key]
    public int Id {get;set;}
    [ForeignKey("LessonID")]
    public int ?LessonID {get;set;}
    public Lessons ? lesson {get;set;}
}

public class Assignmentfiles :files
{
    [Key]
    public int Id {get;set;}
    [ForeignKey("AssignmentID")]
    public int ?AssignmentID {get;set;}
    public Assignments ?assignment {get;set;}
    
}

public class Quizfiles :files
{
    [Key]
    public int Id {get;set;}
    [ForeignKey("QuizID")]
    public int ?QuizID {get;set;}
    public Quizzes ?quiz {get;set;}
    
}
