using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class UserDTO
    {
        public string code {get;set;}
        public string Faculty {get;set;}
        public string Division {get;set;} // el sho3ba
        public string Group {get;set;}
        public string email {get;set;}
        public string password {get;set;}
        public string name {get;set;}
    }

    public class LoginUserDTO
    {
        public string email {get;set;}
        public string password {get;set;}
    }

    public class UserIdandPageNum
    {
        public string UserID {get;set;}
        public int PageNum {get;set;}
    }
}