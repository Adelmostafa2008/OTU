using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class cascadedeletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignmentfiles_assignments_AssignmentID",
                table: "Assignmentfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_Quizfiles_quizzes_QuizID",
                table: "Quizfiles");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignmentfiles_assignments_AssignmentID",
                table: "Assignmentfiles",
                column: "AssignmentID",
                principalTable: "assignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities",
                column: "LessonID",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Quizfiles_quizzes_QuizID",
                table: "Quizfiles",
                column: "QuizID",
                principalTable: "quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Assignmentfiles_assignments_AssignmentID",
                table: "Assignmentfiles");

            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_Quizfiles_quizzes_QuizID",
                table: "Quizfiles");

            migrationBuilder.AddForeignKey(
                name: "FK_Assignmentfiles_assignments_AssignmentID",
                table: "Assignmentfiles",
                column: "AssignmentID",
                principalTable: "assignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities",
                column: "LessonID",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Quizfiles_quizzes_QuizID",
                table: "Quizfiles",
                column: "QuizID",
                principalTable: "quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
