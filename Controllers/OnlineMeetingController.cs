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
        private readonly IOnlineMeetRepo _repo;
        private readonly UserManager<User> _manager;
        private readonly OnlineMeetService _service;

        public OnlineMeetingController(IOnlineMeetRepo om,UserManager<User> ur , OnlineMeetService ser)
        {
            _service = ser;
            _manager = ur;
            _repo = om;
        }

        [HttpPost]
        public async Task<IActionResult> UploadOnlineMeeting([FromBody] OnlineMeetUploadDTO meeting)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.UploadOnlineMeeting(meeting);

            if(!res.flag) return BadRequest(res.msg);

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteOnlineMeeting([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _repo.GetById(id);

            if(item != null)
            {
                await _repo.Delete(item);
                return Ok("Deleted Successfully !");
            }

            return NotFound("There Is No Meeting With Such Id");
           
        }        

        [HttpPut ("{id}")]
        public async Task<IActionResult> EditOnlineMeeting([FromRoute] int id , [FromBody] OnlineMeetEditDTO newMeet)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);
            
            var flag = await _service.EditOnlineMeeting(id , newMeet);

            if(flag)
            {
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        } 
       
    }
}