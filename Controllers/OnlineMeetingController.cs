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

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OnlineMeetingController : ControllerBase
    {
        private readonly IOnlineMeetRepo _om;
        private readonly UserManager<User> _ur;
        private readonly OnlineMeetService _service;

        public OnlineMeetingController(IOnlineMeetRepo om,UserManager<User> ur , OnlineMeetService ser)
        {
            _service = ser;
            _ur = ur;
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
        public async Task<IActionResult> editOnlineMeeting([FromRoute] int id , [FromBody] OnlineMeetEditDTO newMeet)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);
            
            var flag = await _service.editOnlineMeet(id , newMeet);

            if(flag)
            {
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        } 
        [HttpGet("{id}")]
        public async Task<IActionResult> getAllMeetings([FromRoute] string id , [FromBody] bool IsCard = false)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _ur.FindByIdAsync(id);

            if(user == null) return NotFound("No user with such id");

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var meets  = await _om.GetAllMeetsWithStudentSort(sort);

            if(!meets.Any() || meets.Count == 0) return NotFound("No Meetings at the time .");

            var veiwmeets = meets.Select(x => new
            {
               division = x.Division,
               faculty = x.Faculty,
               notes = x.Notes,
               id = x.Id,
               date = x.OnlineMeetingDate,
               semester = x.semester,
               subject = x.Subject,
               title = x.Title,
               year = x.Year  
            }).OrderBy(x => x.date).AsQueryable();

            if (IsCard)
            {
                veiwmeets = veiwmeets.Take(6);
            }

            veiwmeets.ToList();

            return Ok(veiwmeets);
        }
        [HttpGet("single/{meet_id}")]
        public async Task<IActionResult> getSingleOnlineMeetingData([FromRoute] int meet_id , [FromQuery] string user_id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var data = await _service.handelSingleOnlineMeetingFetch(user_id , meet_id);

            if(data == null) return NotFound("No meeting with such Id");

            return Ok(data);
        }
    }
}