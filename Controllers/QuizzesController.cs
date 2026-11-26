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
        private readonly IQuizzesRepo _repo;
        private readonly UserManager<User> _manager;
        private readonly QuizService _service;

        public QuizzesController(IQuizzesRepo qr , UserManager<User> ur ,QuizService ser)
        {
            _service = ser;
            _manager = ur;
            _repo = qr;
        }

        [HttpPost]
        public async Task<IActionResult> UploadQuiz([FromBody] QuizUploadDTO item)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.UploadQuiz(item);

            if(!res.flag) return BadRequest(res.msg);

            if(res.msg == "Upload docs")
            {
                return Ok(res.headers);
            }

            return Created();
        }

        [HttpDelete ("{id}")]
        public async Task<IActionResult> DeleteQuiz([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.DeleteQuiz(id);

            if(!res.flag) return BadRequest(res.msg);

            return Ok(res.msg);
           
        }         

        [HttpPut ("{id}")]
        public async Task<IActionResult> EditQuiz([FromRoute] int id , [FromBody] QuizEditDTO newquiz)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.EditQuiz(id , newquiz);

            if(!res.flag) return BadRequest(res.msg);

            return Ok(res.msg);
           
        }

        [HttpPut("deletefiles/{quizid}")]
        public async Task<IActionResult> EditQuiz_DeleteFiles([FromRoute] int quizid , IList<string> keys)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.Edit_DeleteFiles(quizid , keys);

            if(!res.flag) return BadRequest(res.msg);

            return Ok(res.msg);
        }

        [HttpPut("addfiles/{quizid}")]

        public async Task<IActionResult> EditQuiz_AddFiles([FromRoute] int quizid , QuizEditDTO newquiz)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _service.Edit_AddFiles(quizid , newquiz);

            if(!res.flag) return BadRequest(res.msg);

            return Ok(res.headers);
        }
        
    }
}