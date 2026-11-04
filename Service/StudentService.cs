using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Identity;

namespace backend.Service
{
    public class result
    {
        public bool flag {get;set;}
        public string msg {get;set;}
    }
    public class StudentService
    {
        private readonly UserManager<User> _ur;

        public StudentService(UserManager<User> ur)
        {
            _ur = ur;
        }

        public async Task<result> changePassword(string userid , string oldpass , string newpass)
        {
            var user = await _ur.FindByIdAsync(userid);

            if(user == null) return new result{flag = false , msg = "Invalid User ID."};

            var taskres  = await _ur.ChangePasswordAsync(user , oldpass , newpass);

            if(!taskres.Succeeded) return new result{flag = false , msg = "Faild : Old Password Is Invalid."};

            return new result{flag = true , msg = "Password Changed Successfully."};
        }    
    }
}