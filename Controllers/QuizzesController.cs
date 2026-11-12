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
        public async Task<IActionResult> UploadQuiz([FromBody] QuizzUploadDTO item)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.UploadQuiz(item);

            if(!res.flag) return BadRequest(res.msg);

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteQuiz([FromRoute] int id)
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
        public async Task<IActionResult> EditQuiz([FromRoute] int id , [FromBody] QuizzEditDTO newquiz)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var flag = await _service.EditQuiz(id , newquiz);

            if(flag)
            {                
                return Ok("Edited Successfully !");
            }
            return NotFound("There Is No Item With Such Id");
        }
        
    }
}