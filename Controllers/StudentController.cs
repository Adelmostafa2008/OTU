using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Repos.interfaces;
using backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StudentController(ILessonRepo lesson , UserManager<User> manager , StudentService student_service 
                                  , IOnlineMeetRepo meet , AssignmentService assignment_service , OnlineMeetService meet_service , IQuizzesRepo quiz , QuizService quiz_service) : ControllerBase
    {
        #region Dependancies
        private readonly ILessonRepo _lesson = lesson; 
        private readonly UserManager<User> _manager = manager; 
        private readonly StudentService _student_service = student_service; 
        private readonly IOnlineMeetRepo _meet = meet;
        private readonly OnlineMeetService _meet_service = meet_service;
        private readonly IQuizzesRepo _quiz = quiz;
        private readonly QuizService _quiz_service = quiz_service;
        private readonly AssignmentService _assignment_service = assignment_service;
        #endregion

        #region Lessons
        [HttpGet("lesson")]
        public async Task<IActionResult> getAllUploads([FromQuery] UploadSearch search, [FromBody] UserIdandPageNum user)
        {
             if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var studentDetails = await _manager.FindByIdAsync(user.UserID);

            if(studentDetails == null) return NotFound("No User With Such Id");

            UploadSort sort = new UploadSort
            {
                Division = studentDetails.Division,
                Faculty = studentDetails.Faculty,
                Year = studentDetails.Year
            };

            var allUploads = await _lesson.GetAllUploads(search, sort , user.PageNum);

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
                year = item.Year,
                type = item.Type,
                uploadername = item.UploaderName

            }).ToList();

            return Ok(Vres);
        }

        [HttpGet ("lesson/{id}")]
        public async Task<IActionResult> getUploadById([FromRoute] int id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var item = await _lesson.GetById(id);

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
                year = item.Year,
                type = item.Type,
                uploadername = item.UploaderName
            };

            return Ok(veiwItem);
        }

        [HttpGet("getlatest/{userid}")]
        public async Task<IActionResult> getNewestUploads([FromRoute] string userid)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var res = await _student_service.GetNewestUploads(userid);

            if(!res[0].flag) return BadRequest(res[0].msg);
            
            return Ok(res);
        }
        #endregion

        #region Online_Meetings

        [HttpGet("meeting/{id}")]
        public async Task<IActionResult> getAllMeetings([FromRoute] string id , [FromBody] bool IsCard = false)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _manager.FindByIdAsync(id);

            if(user == null) return NotFound("No user with such id");

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var meets  = await _meet.GetAllMeetsWithStudentSort(sort);

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
               year = x.Year  ,
               uploadername = x.UploaderName
            }).OrderBy(x => x.date).AsQueryable();

            if (IsCard)
            {
                veiwmeets = veiwmeets.Take(6);
            }

            veiwmeets.ToList();

            return Ok(veiwmeets);
        }
        [HttpGet("meeting/single/{meet_id}")]
        public async Task<IActionResult> getSingleOnlineMeetingData([FromRoute] int meet_id , [FromQuery] string user_id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var data = await _meet_service.HandelSingleOnlineMeetingFetch(user_id , meet_id);

            if(data == null) return NotFound("No meeting with such Id");

            return Ok(data);
        }
        #endregion
        
        #region Quizzes

        [HttpGet("quiz/{id}")]
        public async Task<IActionResult> getAllQuizzes([FromRoute] string id , [FromBody] bool IsCard = false) // handel the iscard and make it from query and change what need to be changed
        {
            var user = await _manager.FindByIdAsync(id);

            if(user == null) return NotFound("No user with such id");

            UploadSort sort = new UploadSort()
            {
                Division = user.Division,
                Faculty = user.Faculty,
                Year = user.Year                
            };

            var quizzes = await _quiz.GetAllQuizzesWithStudentSort(sort);

            if(!quizzes.Any() || quizzes.Count == 0) return NotFound("No quizzes at the time .");

            var veiwquizzes = quizzes.Select(x => new
            {
               division = x.Division,
               faculty = x.Faculty,
               notes = x.Notes,
               id = x.Id,
               date = x.QuizDate,
               semester = x.semester,
               subject = x.Subject,
               title = x.Title,
               year = x.Year  ,
               uploadername = x.UploaderName
            }).OrderBy(x => x.date).AsQueryable();

            if(IsCard)
            {
                veiwquizzes = veiwquizzes.Take(6);
            }
            
            veiwquizzes.ToList();

            return Ok(veiwquizzes);
        }
        [HttpGet("quiz/single/{quiz_id}")]
        public async Task<IActionResult> getSingleQuizData([FromRoute] int quiz_id , [FromQuery] string user_id)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);


            var data = await _quiz_service.HandelSingleQuizFetch(user_id , quiz_id);

            if(data == null) return NotFound("No meeting with such Id");

            return Ok(data);
        }
        #endregion

        #region Others... 

        [HttpPost("congrats")]
        public async Task<IActionResult> WeGrowAYear([FromBody] string userid)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _manager.FindByIdAsync(userid);

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
            await _lesson.Save();

            return Ok(new
            {
                newyear = user.Year
            });
        } 

        [HttpPost ("phone/{id}")]
        public async Task<IActionResult> editPhoneNum([FromBody] string phonenum ,[FromRoute] string id)
        {
            Console.WriteLine($"the {phonenum}");

            if(!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _manager.FindByIdAsync(id);

            if(user == null) return NotFound("No user with such id.");

            user.PhoneNumber = phonenum;

            await _lesson.Save();

            return Ok(new {phone = phonenum});
        }

        [HttpPost("newpass")]
        public async Task<IActionResult> changePassword([FromBody] ChangePasswordDTO obj)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _student_service.changePassword(obj.userid , obj.oldpassword , obj.newpassword);

            if(!response.flag) return BadRequest(response.msg);

            return Ok(response.msg);
        }

        #endregion
        
        #region Assignments
        [HttpGet("assignment/all/{userid}")]
        public async Task<IActionResult> GetAllAssignments([FromRoute] string userid , [FromQuery] bool IsCard , [FromQuery] int PageNum)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var assignments = await _assignment_service.GetAllAssignments(userid , IsCard , PageNum);

            if(assignments[0].flag == false) return BadRequest(assignments[0].msg);

            return Ok(assignments);
        }

        [HttpGet("assignment/{userid}")]
        public async Task<IActionResult> GetAssignmentDetails([FromRoute] string userid , [FromQuery] int assignmentId)
        {
            if(!ModelState.IsValid) return BadRequest(ModelState);

            var assignment = await _assignment_service.GetAssignment(userid , assignmentId);

            if(assignment.flag == false) return BadRequest(assignment.msg);

            return Ok(assignment); 
        }
        #endregion
    }
}
