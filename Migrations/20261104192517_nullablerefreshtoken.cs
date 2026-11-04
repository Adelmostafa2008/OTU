using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class nullablerefreshtoken : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<DateTime>(
                name: "RefreshTokenExpiryDate",
                table: "AspNetUsers",
                type: "datetime(6)",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshToken",
                table: "AspNetUsers",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AlterColumn<DateTime>(
                name: "RefreshTokenExpiryDate",
                table: "AspNetUsers",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime(6)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "RefreshToken",
                keyValue: null,
                column: "RefreshToken",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "RefreshToken",
                table: "AspNetUsers",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

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
    }
}
