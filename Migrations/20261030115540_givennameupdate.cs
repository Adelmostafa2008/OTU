using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class givennameupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "abff48bc-aa8b-4670-b202-dc30851459a2");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "c6e01958-265a-4657-9246-3d951e68e175");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e390a01e-22f6-41d1-b96d-a97a46b7035a");

            migrationBuilder.AddColumn<string>(
                name: "givenName",
                table: "AspNetUsers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "40bc9fc3-c025-4f99-8ad0-16bd711fdb24", "ef8e0ef9-611f-4226-926d-33c820a5c9c8", "instructor", "INSTRUCTOR" },
                    { "47f7e06f-2c7e-4131-9b64-113ecfac2819", "df7f1364-f5e1-4ef8-b534-be5303d8158a", "student", "STUDENT" },
                    { "85b8a302-4f94-40fd-8947-2de6b8ab657e", "a848b420-ffe7-4368-a3b9-b7a7da0ceefd", "admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "40bc9fc3-c025-4f99-8ad0-16bd711fdb24");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "47f7e06f-2c7e-4131-9b64-113ecfac2819");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "85b8a302-4f94-40fd-8947-2de6b8ab657e");

            migrationBuilder.DropColumn(
                name: "givenName",
                table: "AspNetUsers");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "abff48bc-aa8b-4670-b202-dc30851459a2", "ab987aa9-daee-40a8-b675-8d3e2af3cb96", "admin", "ADMIN" },
                    { "c6e01958-265a-4657-9246-3d951e68e175", "1a702614-8403-4113-9c2c-5b56d4150990", "student", "STUDENT" },
                    { "e390a01e-22f6-41d1-b96d-a97a46b7035a", "f2c21749-0d01-4ffe-8c0a-4f2f50e62b58", "instructor", "INSTRUCTOR" }
                });
        }
    }
}
