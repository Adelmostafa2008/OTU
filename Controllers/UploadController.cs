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
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.SignalR.Protocol;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly ILessonRepo _lr;
        private readonly UserManager<User> _manager;
        public UploadController(ILessonRepo lr , UserManager<User> manager)
        {
            _manager = manager;
            _lr = lr;
        }

        [HttpPost]
        public async Task<IActionResult> UploadLesson([FromBody] UploadDTO item)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            LessonService _service = new LessonService(_manager,_lr);

            var res = await _service.UploadALesson(item);

            if(!res.flag) return BadRequest(res.msg);

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteLesson([FromRoute] int id)
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
        public async Task<IActionResult> EditLesson([FromRoute] int id , [FromBody] EditUpDTO newitem)
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
                    Year = newitem.Year  ,
                    Type = newitem.Type
                    ,UploadDate = item.UploadDate
                };
                await _lr.Delete(newnewitem);
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        }
    }
}