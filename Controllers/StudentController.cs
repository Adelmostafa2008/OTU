using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    
    public class StudentController(ILessonRepo up , UserManager<User> st) : ControllerBase
    {
        private readonly ILessonRepo _up = up;
        private readonly UserManager<User> _st = st;

        [HttpGet]
        public async Task<IActionResult> getAllUploads([FromQuery] UploadSearch search, [FromQuery] UploadSort sort , [FromBody] UserIdandPageNum user)
        {
             if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var studentDetails = await _st.FindByIdAsync(user.UserID);

            if(studentDetails == null) return NotFound("No User With Such Id");

            sort.Division = studentDetails.Division;
            sort.Faculty = studentDetails.Faculty;
            sort.Year = studentDetails.Year;

            var allUploads = await _up.GetAllUploads(search, sort , user.PageNum);

            if (!allUploads.Any() || allUploads.Count == 0) return NotFound("No Uploads Found");

            var Vres = allUploads.Select(item => new 
            {
                Id = item.Id,
                link = item.Link,
                division = item.Faculty,
                faculty = item.Faculty,
                notes = item.Notes,
                semester = item.semester,
                subject = item.Subject,
                title = item.Title,
                year = item.Year

            }).ToList();

            return Ok(Vres);
        }

        [HttpGet ("{id}")]
        public async Task<IActionResult> getUploadById([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _up.GetById(id);

            if(item == null)
            {
                return NotFound();
            }

            var veiwItem = new
            {
                link = item.Link,
                division = item.Faculty,
                faculty = item.Faculty,
                notes = item.Notes,
                semester = item.semester,
                subject = item.Subject,
                title = item.Title,
                year = item.Year
            };

            return Ok(veiwItem);
        }

        [HttpPost("congrats")]
        public async Task<IActionResult> WeGrowAYear([FromBody] string userid)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _st.FindByIdAsync(userid);

            if(user == null) return NotFound();

            if(user.Year >= 4)
            {
                return Ok(new
                {
                   goodbye = true,
                   message = "it was an honor serving you , Technologist of the Future ;D" 
                });
            }

            user.Year += 1;
            await _up.Save();

            return Ok(new
            {
                newyear = user.Year
            });
        } 
    }
}