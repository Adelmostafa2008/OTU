using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Mappers;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Identity;

namespace backend.Service
{
    public class LessonService
    {
        private readonly UserManager<User> _manager;
        private readonly ILessonRepo _repo;

        public LessonService(UserManager<User> manager , ILessonRepo repo)
        {
            _repo = repo;
            _manager = manager;
        }

        public async Task<result> UploadALesson(UploadDTO lesson)
        {
            var user = await _manager.FindByIdAsync(lesson.userid);

            if(user == null) return new result {flag = false , msg = "Invalid Uploader ID."};

            LessonsMapper mapper = new LessonsMapper{};

            var new_lesson = mapper.UploadLessonMapper(lesson , user);

            await _repo.Create(new_lesson);

            return new result{flag = true , msg = "Lesson Uploaded Successfully."};
        }
    }
}