using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Repos.interfaces;
using backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AssignmentController : ControllerBase
    {
        private readonly AssignmentService _service;

        public AssignmentController(AssignmentService sr)
        {
            _service = sr;
        }

        [HttpPost("{userid}")]
        public async Task<IActionResult> createAssignment([FromRoute] string userid , [FromBody] AssignmentUpload assignment)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _service.createNewAssignment(userid , assignment);

            if(!result.flag) return BadRequest(result.msg);

            return Ok(result.msg);
        }

        [HttpDelete("{assignmentId}")]
        public async Task<IActionResult> deleteAssignment([FromRoute] int assignmentId)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _service.deleteAssignment(assignmentId);

            if(!result.flag) return BadRequest(result.msg);

            return Ok(result.msg);
        }

        [HttpPut("{assId}")]
        public async Task<IActionResult> editAssignment([FromRoute] int assId , [FromBody] AssignmentEdit newAssignment)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _service.editAssignment(assId , newAssignment);

            if(!result.flag) return BadRequest(result.msg);

            return Ok(result.msg);
        }
    }
}