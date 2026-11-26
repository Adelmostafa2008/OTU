using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.data;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.SignalR.Protocol;
using Microsoft.VisualBasic;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class UploadController : ControllerBase
    {
        private readonly ILessonRepo _lr;
        private readonly FileUploadService _service;
        private readonly UserManager<User> _manager;
        private readonly IConfiguration _config;
        private readonly IFilebaseClient _s3;
        private readonly LessonService _lessonservice;
        private readonly AppDb appDb;
        public UploadController(ILessonRepo lr ,AppDb app1, LessonService lessonService,IFilebaseClient s3  , IConfiguration config, FileUploadService service,UserManager<User> manager)
        {
            appDb = app1;
            _lessonservice = lessonService;
            _s3 = s3;
            _config = config;
            _service = service;
            _manager = manager;
            _lr = lr;
        }

        [HttpPost]
        public async Task<IActionResult> UploadLesson([FromBody] UploadAndEditDTO lesson)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            LessonService _service = new LessonService(_manager,appDb,_s3,_config  ,_lr);

            var res = await _service.UploadLesson(lesson);

            if(!res.flag) return BadRequest(res.msg);

            if(res.msg == "Upload docs" && res.headers.Any())
            {
                return Ok(res.headers); 
            }

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteLesson([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _lessonservice.DeleteLesson(id);

            if(!res.flag) return BadRequest(res.msg);

            return Ok(res.msg);
           
        }        

        [HttpPut ("{id}")]
        public async Task<IActionResult> EditLessonTXTvalues([FromRoute] int id , [FromBody] UploadAndEditDTO lesson)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _lessonservice.EditLesson(lesson , id);

            if(!res.flag) return BadRequest(res.msg);

            return Ok(res.msg);
        }

        [HttpPut("deletefiles/{id}")]
        public async Task<IActionResult> EditLessonDeleteFiles ([FromRoute] int id , [FromBody] IList<string> keys)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _lessonservice.Edit_DeleteFiles(id , keys);

            if(res.flag == false) return BadRequest(res.msg);

            return Ok(res.msg);
        }

        [HttpPut("addfiles/{id}")]
        public async Task<IActionResult> EditLessonAddFiles ([FromRoute] int id , [FromBody]UploadAndEditDTO newlesson)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);
            
            var res = await _lessonservice.Edit_UploadFiles(newlesson , id);

            if(!res.flag) return BadRequest(res.msg);

            if(res.msg == "Upload docs")
            {
                return Ok(res.headers);
            }

            return Ok();
        }

        #region tests

        [HttpGet("testget1")]
        public async Task<IActionResult> getfile([FromQuery] string filename)
        {
            var response = await _service.getFile(filename);

            return Ok(response);
        }
        [HttpGet("testgetlist")]
        public async Task<IActionResult> getlistoffiles([FromQuery] string prefix)
        {
            var response = await _service.getfiles(prefix);

            return Ok(response);
        }

       
        #endregion
    }
}