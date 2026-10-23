using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizzesController : ControllerBase
    {
        private readonly IQuizzesRepo _qr;

        public QuizzesController(IQuizzesRepo qr)
        {
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
        public async Task<IActionResult> editItem([FromRoute] int id , [FromBody] QuizzEditDTO newitem)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _qr.GetById(id);

            if(item != null)
            {
                Quizzes newnewitem = new Quizzes
                {
                    Id = item.Id,
                    Faculty = newitem.Faculty,
                    Division = newitem.Division,
                    Notes = newitem.Notes,
                    semester = newitem.semester,
                    Subject = newitem.Subject,
                    Title = newitem.Title,
                    Year = newitem.Year  ,
                    QuizDate = newitem.QuizDate
                };
                await _qr.Delete(newnewitem);
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        }
    }
}