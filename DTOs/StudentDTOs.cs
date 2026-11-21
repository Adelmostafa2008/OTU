using System;

namespace backend.DTOs;

public class LessonDetailsDTO
{
    public string title {get;set;}
    public string uploadername {get;set;}
    public string ?link {get;set;}
    public string ?text {get;set;}
    public string ? notes {get;set;}
    public IList<string> ? filesurls{get;set;}
    public bool iscreator {get;set;} = false;
    public int id {get;set;}
}
