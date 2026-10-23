using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class mig2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "518437f1-91c0-420e-9ef7-77916b5bea4c");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "77639709-9234-4027-8852-cfe5993a1361");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "aa788230-86be-4c28-837f-89fb7a0b7a53");

            migrationBuilder.RenameColumn(
                name: "code",
                table: "AspNetUsers",
                newName: "UniversityCode");

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "AspNetUsers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "uploads",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Link = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Title = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Faculty = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Division = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Subject = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Year = table.Column<int>(type: "int", nullable: false),
                    semester = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Notes = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UploadDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_uploads", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "uploads");

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

            migrationBuilder.DropColumn(
                name: "Year",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "UniversityCode",
                table: "AspNetUsers",
                newName: "code");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "518437f1-91c0-420e-9ef7-77916b5bea4c", "24236c97-8fa7-44c0-965d-4cc42c2c0a58", "admin", "ADMIN" },
                    { "77639709-9234-4027-8852-cfe5993a1361", "631c7778-e9ba-4c78-b39d-da998ff539ad", "instructor", "INSTRUCTOR" },
                    { "aa788230-86be-4c28-837f-89fb7a0b7a53", "a3fcb836-3095-4d64-81ef-6783df7211e3", "student", "STUDENT" }
                });
        }
    }
}
