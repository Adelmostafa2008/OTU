using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.SignalR.Protocol;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
   // [Authorize (Roles = "admin")]
    public class UploadController : ControllerBase
    {
        private readonly ILessonRepo _lr;
        public UploadController(ILessonRepo lr)
        {
            _lr = lr;
        }

        [HttpPost]
        public async Task<IActionResult> uploadItem([FromBody] UploadDTO item)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            Lessons newLesson = new Lessons
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Link = item.Link,
              Notes = item.Notes,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year  ,
              UploadDate = DateTime.UtcNow
            };

            await _lr.Create(newLesson);

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> deleteItem([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _lr.GetById(id);

            if(item != null)
            {
                await _lr.Delete(item);
                return Ok("Deleted Successfully !");
            }

            return NotFound("There Is No Item With Such Id");
           
        }        

        [HttpPut ("{id}")]
        public async Task<IActionResult> editItem([FromRoute] int id , [FromBody] EditUpDTO newitem)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _lr.GetById(id);

            if(item != null)
            {
                Lessons newnewitem = new Lessons
                {
                    Id = item.Id,
                    Faculty = newitem.Faculty,
                    Division = newitem.Division,
                    Link = newitem.Link,
                    Notes = newitem.Notes,
                    semester = newitem.semester,
                    Subject = newitem.Subject,
                    Title = newitem.Title,
                    Year = newitem.Year  
                    ,UploadDate = item.UploadDate
                };
                await _lr.Delete(newnewitem);
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        }
    }
}