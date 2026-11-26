using System;
using System.ComponentModel.DataAnnotations;
using backend.Service;

namespace backend.DTOs;

public class GetLessonDetailsDTO
{
    public string title {get;set;}
    public string uploadername {get;set;}
    public string ?link {get;set;}
    public string ?text {get;set;}
    public string ? notes {get;set;}
    public IList<string> ? filesurls{get;set;}
    public bool iscreator {get;set;} = false;
    public int id {get;set;}
    public string Faculty {get;set;}
    public string Division {get;set;}
    public string Subject {get;set;}
    public int Year {get;set;}
    public string semester {get;set;}
    public string ?Type {get;set;}
    public string ? UploadContentType {get;set;}
}

public class Edit_GetLessonDetailsDTO
{
    public int          id                  {get;set;}
    public string       Faculty              {get;set;}
    public string       Division            {get;set;}
    public string       Subject             {get;set;}
    public int          Year                {   get;set;}
    public string       semester            {get;set;}
    public string       ?Type               {get;set;}
    public string       ?UploadContentType  {get;set;}
    public string       title               {get;set;}
    public string       ?link               {get;set;}
    public string       ?text               {get;set;}
    public string       ?notes              {get;set;}
    public IList<files> ?files              {get;set;}
}

public class GetQuizDetailsDTO 
{
     public string ?title {get;set;}
    public string ?uploadername {get;set;}
    public string ?link {get;set;}
    public string ?text {get;set;}
    public string ? notes {get;set;}
    public IList<string> ? filesurls{get;set;}
    public bool? iscreator {get;set;} = false;
    public int ?id {get;set;}
    public string ?Faculty {get;set;}
    public string ?Division {get;set;}
    public string ?Subject {get;set;}
    public int Year {get;set;}
    public string ?semester {get;set;}
    public string ? UploadContentType {get;set;}
    public bool flag {get;set;} = false;
    public string ? msg {get;set;} = "";
    public DateTime ? date {get;set;}
}

public class GetQuizDetailsDTO_Edit
{
    public string ?title {get;set;}
    public string ?link {get;set;}
    public string ?text {get;set;}
    public string ? notes {get;set;}
    public IList<files> ? files{get;set;}
    public int ?id {get;set;}
    public string ?Faculty {get;set;}
    public string ?Division {get;set;}
    public string ?Subject {get;set;}
    public int Year {get;set;}
    public string ?semester {get;set;}
    public DateTime ? date {get;set;}
    public string ? UploadContentType {get;set;}
    public bool flag {get;set;} = false;
    public string ? msg {get;set;} = "";
}
