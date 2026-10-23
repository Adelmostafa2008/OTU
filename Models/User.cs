using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class User : IdentityUser
    {
        public string UniversityCode {get;set;}
        public string Faculty {get;set;}
        public string Division {get;set;} // el sho3ba
        public string Group {get;set;}
        public int Year {get;set;} = 1;
        public string RefreshToken {get;set;}
        public DateTime RefreshTokenExpiryDate {get;set;}
    }
}