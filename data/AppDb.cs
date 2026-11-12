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

           
                builder.Entity<Lessons>()
                .HasOne(l => l.Uploader)
                .WithMany(u => u.lessons)
                .HasForeignKey(l => l.UploaderId)
                .OnDelete(DeleteBehavior.SetNull);

                builder.Entity<Quizzes>()
                .HasOne(l => l.Uploader)
                .WithMany(u => u.quizzes)
                .HasForeignKey(l => l.UploaderId)
                .OnDelete(DeleteBehavior.SetNull);

                builder.Entity<Assignments>()
                .HasOne(l => l.Uploader)
                .WithMany(u => u.assignments)
                .HasForeignKey(l => l.UploaderId)
                .OnDelete(DeleteBehavior.SetNull);

                builder.Entity<OnlineMeetings>()
                .HasOne(l => l.Uploader)
                .WithMany(u => u.meetings)
                .HasForeignKey(l => l.UploaderId)
                .OnDelete(DeleteBehavior.SetNull);
            
            builder.Entity<IdentityRole>().HasData(
                new IdentityRole
                {
                    Id = "021b4019-88ed-485d-aefd-fa4a40a00c59",
                    Name = "admin",
                    NormalizedName = "ADMIN",
                    ConcurrencyStamp = "17f4903e-6495-4380-9da5-f34704b33965"
                },
                new IdentityRole
                {
                    Id = "04d72bb8-d372-4707-8ad7-ac3594e839eb",
                    Name = "student",
                    NormalizedName = "STUDENT",
                    ConcurrencyStamp = "cf2d63f0-154d-4db5-9e13-0a6b076cb0a1"
                },
                new IdentityRole
                {
                    Id = "a2e734a7-e623-436a-9ba5-07bbf03207e4",
                    Name = "guest",
                    NormalizedName = "GUEST",
                    ConcurrencyStamp = "6c4d6e20-986f-408f-b253-cf87270cc109"
                },
                new IdentityRole
                {
                    Id = "fbf09d88-dc4f-40f2-ba17-41bf8992391b",
                    Name = "instructor",
                    NormalizedName = "INSTRUCTOR",
                    ConcurrencyStamp = "1db14024-4ff1-48ac-94f1-fec0cee64a73"
                }
            );
        }


        public DbSet<User> users {get;set;}
        public DbSet<Lessons> lessons {get;set;}
        public DbSet<Quizzes> quizzes {get;set;}
        public DbSet<OnlineMeetings> onlineMeetings {get;set;}
        public DbSet<Assignments> assignments {get;set;}
    }
}