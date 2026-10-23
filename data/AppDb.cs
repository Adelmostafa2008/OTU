using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.data
{
    public class AppDb : IdentityDbContext<User>
    {
         public AppDb(DbContextOptions<AppDb> dbContextOptions) : base(dbContextOptions)
        {

        }

         protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            List<IdentityRole> roles = new List<IdentityRole>
            {
                new IdentityRole {
                    Name = "student",
                    NormalizedName = "STUDENT"
                },
                new IdentityRole {
                    Name = "admin",
                    NormalizedName = "ADMIN"
                },
                new IdentityRole
                {
                  Name= "instructor",
                  NormalizedName = "INSTRUCTOR"  
                }
            };

            builder.Entity<IdentityRole>().HasData(roles);
           
        }

        public DbSet<User> users {get;set;}
        public DbSet<Lessons> lessons {get;set;}
        public DbSet<Quizzes> quizzes {get;set;}
        public DbSet<OnlineMeetings> onlineMeetings {get;set;}
    }
}