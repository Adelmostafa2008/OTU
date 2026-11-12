using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class newstuff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "2ac0c3b6-6931-4d26-88d8-56713b18d99a");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "86dc07f7-5d0a-49f2-b39c-8ec882e351f1");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "8a5f70fb-6556-420c-87de-5b1c449b38de");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "quizzes",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "quizzes",
                type: "varchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UploaderId",
                table: "quizzes",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UploaderName",
                table: "quizzes",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "onlineMeetings",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "onlineMeetings",
                type: "varchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UploaderId",
                table: "onlineMeetings",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UploaderName",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "lessons",
                type: "varchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "lessons",
                type: "varchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UploaderId",
                table: "lessons",
                type: "varchar(255)",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "UploaderName",
                table: "lessons",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Deadline = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Title = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Faculty = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Division = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    semester = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "varchar(250)", maxLength: 250, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UploaderId = table.Column<string>(type: "varchar(255)", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UploaderName = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_assignments_AspNetUsers_UploaderId",
                        column: x => x.UploaderId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "021b4019-88ed-485d-aefd-fa4a40a00c59", "17f4903e-6495-4380-9da5-f34704b33965", "admin", "ADMIN" },
                    { "04d72bb8-d372-4707-8ad7-ac3594e839eb", "cf2d63f0-154d-4db5-9e13-0a6b076cb0a1", "student", "STUDENT" },
                    { "a2e734a7-e623-436a-9ba5-07bbf03207e4", "6c4d6e20-986f-408f-b253-cf87270cc109", "guest", "GUEST" },
                    { "fbf09d88-dc4f-40f2-ba17-41bf8992391b", "1db14024-4ff1-48ac-94f1-fec0cee64a73", "instructor", "INSTRUCTOR" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_quizzes_UploaderId",
                table: "quizzes",
                column: "UploaderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_onlineMeetings_UploaderId",
                table: "onlineMeetings",
                column: "UploaderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_lessons_UploaderId",
                table: "lessons",
                column: "UploaderId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_assignments_UploaderId",
                table: "assignments",
                column: "UploaderId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_AspNetUsers_UploaderId",
                table: "lessons",
                column: "UploaderId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_onlineMeetings_AspNetUsers_UploaderId",
                table: "onlineMeetings",
                column: "UploaderId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_quizzes_AspNetUsers_UploaderId",
                table: "quizzes",
                column: "UploaderId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_lessons_AspNetUsers_UploaderId",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_onlineMeetings_AspNetUsers_UploaderId",
                table: "onlineMeetings");

            migrationBuilder.DropForeignKey(
                name: "FK_quizzes_AspNetUsers_UploaderId",
                table: "quizzes");

            migrationBuilder.DropTable(
                name: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_quizzes_UploaderId",
                table: "quizzes");

            migrationBuilder.DropIndex(
                name: "IX_onlineMeetings_UploaderId",
                table: "onlineMeetings");

            migrationBuilder.DropIndex(
                name: "IX_lessons_UploaderId",
                table: "lessons");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "021b4019-88ed-485d-aefd-fa4a40a00c59");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "04d72bb8-d372-4707-8ad7-ac3594e839eb");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a2e734a7-e623-436a-9ba5-07bbf03207e4");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "fbf09d88-dc4f-40f2-ba17-41bf8992391b");

            migrationBuilder.DropColumn(
                name: "UploaderId",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "UploaderName",
                table: "quizzes");

            migrationBuilder.DropColumn(
                name: "UploaderId",
                table: "onlineMeetings");

            migrationBuilder.DropColumn(
                name: "UploaderName",
                table: "onlineMeetings");

            migrationBuilder.DropColumn(
                name: "UploaderId",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "UploaderName",
                table: "lessons");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "quizzes",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "quizzes",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(250)",
                oldMaxLength: 250,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "onlineMeetings",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "onlineMeetings",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(250)",
                oldMaxLength: 250,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "lessons",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 100)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "lessons",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(250)",
                oldMaxLength: 250,
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "2ac0c3b6-6931-4d26-88d8-56713b18d99a", "dfe3e176-1352-416f-9bb8-b662572fb80b", "instructor", "INSTRUCTOR" },
                    { "86dc07f7-5d0a-49f2-b39c-8ec882e351f1", "ad171c14-d2cd-4ac2-a7d9-829be249a579", "student", "STUDENT" },
                    { "8a5f70fb-6556-420c-87de-5b1c449b38de", "d9cf95ac-e499-4391-b8c8-8329a12bd69e", "admin", "ADMIN" }
                });
        }
    }
}
