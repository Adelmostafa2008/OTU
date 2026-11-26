using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class sumfixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_assignments_laqId",
                table: "filesEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_lessons_laqId",
                table: "filesEntities");

            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_quizzes_laqId",
                table: "filesEntities");

            migrationBuilder.RenameColumn(
                name: "laqId",
                table: "filesEntities",
                newName: "LessonID");

            migrationBuilder.RenameIndex(
                name: "IX_filesEntities_laqId",
                table: "filesEntities",
                newName: "IX_filesEntities_LessonID");

            migrationBuilder.CreateTable(
                name: "Assignmentfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    AssignmentID = table.Column<int>(type: "int", nullable: true),
                    key = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    filename = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    size = table.Column<int>(type: "int", nullable: false),
                    content_type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignmentfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assignmentfiles_assignments_AssignmentID",
                        column: x => x.AssignmentID,
                        principalTable: "assignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Quizfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    QuizID = table.Column<int>(type: "int", nullable: true),
                    key = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    filename = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    size = table.Column<int>(type: "int", nullable: false),
                    content_type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Quizfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Quizfiles_quizzes_QuizID",
                        column: x => x.QuizID,
                        principalTable: "quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Assignmentfiles_AssignmentID",
                table: "Assignmentfiles",
                column: "AssignmentID");

            migrationBuilder.CreateIndex(
                name: "IX_Quizfiles_QuizID",
                table: "Quizfiles",
                column: "QuizID");

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities",
                column: "LessonID",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities");

            migrationBuilder.DropTable(
                name: "Assignmentfiles");

            migrationBuilder.DropTable(
                name: "Quizfiles");

            migrationBuilder.RenameColumn(
                name: "LessonID",
                table: "filesEntities",
                newName: "laqId");

            migrationBuilder.RenameIndex(
                name: "IX_filesEntities_LessonID",
                table: "filesEntities",
                newName: "IX_filesEntities_laqId");

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_assignments_laqId",
                table: "filesEntities",
                column: "laqId",
                principalTable: "assignments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_lessons_laqId",
                table: "filesEntities",
                column: "laqId",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_quizzes_laqId",
                table: "filesEntities",
                column: "laqId",
                principalTable: "quizzes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
