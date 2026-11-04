using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizzesRepo _qr;
        private readonly UserManager<User> _ur;
        private readonly QuizService _service;

        public QuizzesController(IQuizzesRepo qr , UserManager<User> ur ,QuizService ser)
        {
            _service = ser;
            _ur = ur;
            _qr = qr;
        }

        [HttpPost]
        public async Task<IActionResult> uploadItem([FromBody] QuizzUploadDTO item)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            Quizzes newLesson = new Quizzes
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Notes = item.Notes,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year
              ,QuizDate = item.QuizDate  
            };

            await _qr.Create(newLesson);

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> deleteItem([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _qr.GetById(id);

            if(item != null)
            {
                await _qr.Delete(item);
                return Ok("Deleted Successfully !");
            }

            return NotFound("There Is No Item With Such Id");
           
        }         

        [HttpPut ("{id}")]
        public async Task<IActionResult> editQuiz([FromRoute] int id , [FromBody] QuizzEditDTO newquiz)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var flag = await _service.editQuiz(id , newquiz);

            if(flag)
            {                
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> getAllQuizzes([FromRoute] string id , [FromBody] bool IsCard = false)
        {
            var user = await _ur.FindByIdAsync(id);

            if(user == null) return NotFound("No user with such id");

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var quizzes = await _qr.GetAllQuizzesWithStudentSort(sort);

            if(!quizzes.Any() || quizzes.Count == 0) return NotFound("No quizzes at the time .");

            var veiwquizzes = quizzes.Select(x => new
            {
               division = x.Division,
               faculty = x.Faculty,
               notes = x.Notes,
               id = x.Id,
               date = x.QuizDate,
               semester = x.semester,
               subject = x.Subject,
               title = x.Title,
               year = x.Year  
            }).OrderBy(x => x.date).AsQueryable();

            if(IsCard)
            {
                veiwquizzes = veiwquizzes.Take(6);
            }
            
            veiwquizzes.ToList();

            return Ok(veiwquizzes);
        }
        [HttpGet("single/{quiz_id}")]
        public async Task<IActionResult> getSingleQuizData([FromRoute] int quiz_id , [FromQuery] string user_id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);


            var data = await _service.handelSingleQuizFetch(user_id , quiz_id);

            if(data == null) return NotFound("No meeting with such Id");

            return Ok(data);
        }
    }
}