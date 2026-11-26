using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class newfilesmodels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_filesEntities",
                table: "filesEntities");

            migrationBuilder.RenameTable(
                name: "filesEntities",
                newName: "Lessonfiles");

            migrationBuilder.RenameIndex(
                name: "IX_filesEntities_LessonID",
                table: "Lessonfiles",
                newName: "IX_Lessonfiles_LessonID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Lessonfiles",
                table: "Lessonfiles",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Lessonfiles_lessons_LessonID",
                table: "Lessonfiles",
                column: "LessonID",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lessonfiles_lessons_LessonID",
                table: "Lessonfiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Lessonfiles",
                table: "Lessonfiles");

            migrationBuilder.RenameTable(
                name: "Lessonfiles",
                newName: "filesEntities");

            migrationBuilder.RenameIndex(
                name: "IX_Lessonfiles_LessonID",
                table: "filesEntities",
                newName: "IX_filesEntities_LessonID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_filesEntities",
                table: "filesEntities",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_filesEntities_lessons_LessonID",
                table: "filesEntities",
                column: "LessonID",
                principalTable: "lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
