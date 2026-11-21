using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class crudforcloud : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocsKeys",
                table: "onlineMeetings");

            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "quizzes",
                newName: "files");

            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "lessons",
                newName: "files");

            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "assignments",
                newName: "files");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "files",
                table: "quizzes",
                newName: "DocsKeys");

            migrationBuilder.RenameColumn(
                name: "files",
                table: "lessons",
                newName: "DocsKeys");

            migrationBuilder.RenameColumn(
                name: "files",
                table: "assignments",
                newName: "DocsKeys");

            migrationBuilder.AddColumn<string>(
                name: "DocsKeys",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
