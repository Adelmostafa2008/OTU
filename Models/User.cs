using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class User : IdentityUser
    {
        public string ?RefreshToken {get;set;}
        public DateTime ?RefreshTokenExpiryDate {get;set;}
        public string givenName {get;set;}
        public string ?UniversityCode {get;set;}
        public string ?Faculty {get;set;}
        public string ?Division {get;set;} // el sho3ba
        public string ?Group {get;set;}
        public int ? Year {get;set;}
        public IList<Quizzes> ?quizzes {get;set;}
        public IList<OnlineMeetings> ? meetings {get;set;}
        public IList<Assignments> ?assignments {get;set;}
        public IList<Lessons>? lessons {get;set;}
    }

    

    
}