using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class officiallycloud : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DocsUrls",
                table: "quizzes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Link",
                table: "quizzes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "quizzes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "quizzes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DocsUrls",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Link",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "lessons",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Link",
                table: "lessons",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DocsUrls",
                table: "lessons",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "lessons",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "DocsUrls",
                table: "assignments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Link",
                table: "assignments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Text",
                table: "assignments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "assignments",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DocsUrls",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "Link",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "Text",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "DocsUrls",
                table: "onlineMeetings");

            migrationBuilder.DropColumn(
                name: "Link",
                table: "onlineMeetings");

            migrationBuilder.DropColumn(
                name: "Text",
                table: "onlineMeetings");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "onlineMeetings");

            migrationBuilder.DropColumn(
                name: "DocsUrls",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "Text",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "DocsUrls",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "Link",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "Text",
                table: "assignments");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "assignments");

            migrationBuilder.UpdateData(
                table: "lessons",
                keyColumn: "Type",
                keyValue: null,
                column: "Type",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "lessons",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "lessons",
                keyColumn: "Link",
                keyValue: null,
                column: "Link",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "Link",
                table: "lessons",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
