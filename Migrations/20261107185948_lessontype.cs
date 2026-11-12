using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class lessontype : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "6961510d-84ad-4439-af3a-6ea9b6b06a53");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "d8782df4-0684-474e-9268-c4ba5770dd5e");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "e4cb2f6a-a1f4-4d2b-882c-34537c7663ad");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "lessons",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "Type",
                table: "lessons");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "6961510d-84ad-4439-af3a-6ea9b6b06a53", "fc7194d0-f964-409b-9d7b-301a1bf3043b", "admin", "ADMIN" },
                    { "d8782df4-0684-474e-9268-c4ba5770dd5e", "7ddac967-db6a-4a27-a4bf-8be778f830f5", "instructor", "INSTRUCTOR" },
                    { "e4cb2f6a-a1f4-4d2b-882c-34537c7663ad", "695f8cf2-e643-401c-b827-cc1bf56af648", "student", "STUDENT" }
                });
        }
    }
}
