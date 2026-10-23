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
    public class OnlineMeetingController : ControllerBase
    {
        private readonly IOnlineMeetRepo _om;

        public OnlineMeetingController(IOnlineMeetRepo om)
        {
            _om = om;
        }

        [HttpPost]
        public async Task<IActionResult> uploadItem([FromBody] OnlineMeetUploadDTO item)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            OnlineMeetings newLesson = new OnlineMeetings
            {
              Faculty = item.Faculty,
              Division = item.Division,
              Notes = item.Notes,
              semester = item.semester,
              Subject = item.Subject,
              Title = item.Title,
              Year = item.Year
              ,OnlineMeetingDate = item.OnlineMeetingDate 
            };

            await _om.Create(newLesson);

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> deleteItem([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _om.GetById(id);

            if(item != null)
            {
                await _om.Delete(item);
                return Ok("Deleted Successfully !");
            }

            return NotFound("There Is No Item With Such Id");
           
        }        

        [HttpPut ("{id}")]
        public async Task<IActionResult> editItem([FromRoute] int id , [FromBody] OnlineMeetEditDTO newitem)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _om.GetById(id);

            if(item != null)
            {
                OnlineMeetings newnewitem = new OnlineMeetings
                {
                    Id = item.Id,
                    Faculty = newitem.Faculty,
                    Division = newitem.Division,
                    Notes = newitem.Notes,
                    semester = newitem.semester,
                    Subject = newitem.Subject,
                    Title = newitem.Title,
                    Year = newitem.Year  ,
                    OnlineMeetingDate = newitem.OnlineMeetingDate
                };
                await _om.Delete(newnewitem);
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        }
    }
}