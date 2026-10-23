using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class migrefreshtoken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "8ec3eca5-9dda-49f1-a2ff-28606189f770");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "d01cd4da-ce01-4013-a565-db48795ca4e0");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "ec7d6a8a-8cd7-49e5-a978-5912e31b2379");

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "AspNetUsers",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiryDate",
                table: "AspNetUsers",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "86706bfe-8258-4baa-a659-7902aa42809a", "79cd032b-b56b-42fd-b184-4c24ce71e54c", "student", "STUDENT" },
                    { "cac741fc-21ef-4aef-8b87-9adb1c741549", "e7441bd9-ceb0-4585-8c99-79d7c849e1d5", "instructor", "INSTRUCTOR" },
                    { "fbab98ca-00be-40c9-9fef-3057dbd25c77", "2183708a-7520-4273-929c-f7f6bc388c22", "admin", "ADMIN" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "86706bfe-8258-4baa-a659-7902aa42809a");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "cac741fc-21ef-4aef-8b87-9adb1c741549");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "fbab98ca-00be-40c9-9fef-3057dbd25c77");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiryDate",
                table: "AspNetUsers");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "8ec3eca5-9dda-49f1-a2ff-28606189f770", "8e5729ca-23fb-4992-b283-68702f25c1cb", "admin", "ADMIN" },
                    { "d01cd4da-ce01-4013-a565-db48795ca4e0", "16ff0af1-5f70-4a86-9950-9a76701299c2", "instructor", "INSTRUCTOR" },
                    { "ec7d6a8a-8cd7-49e5-a978-5912e31b2379", "c2fcc19e-7636-4503-9cb3-439d99b835c4", "student", "STUDENT" }
                });
        }
    }
}
