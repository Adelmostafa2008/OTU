using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class uploadsmallmod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DocsUrls",
                table: "quizzes",
                newName: "DocsKeys");

            migrationBuilder.RenameColumn(
                name: "DocsUrls",
                table: "onlineMeetings",
                newName: "DocsKeys");

            migrationBuilder.RenameColumn(
                name: "DocsUrls",
                table: "lessons",
                newName: "DocsKeys");

            migrationBuilder.RenameColumn(
                name: "DocsUrls",
                table: "assignments",
                newName: "DocsKeys");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "quizzes",
                newName: "DocsUrls");

            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "onlineMeetings",
                newName: "DocsUrls");

            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "lessons",
                newName: "DocsUrls");

            migrationBuilder.RenameColumn(
                name: "DocsKeys",
                table: "assignments",
                newName: "DocsUrls");
        }
    }
}
