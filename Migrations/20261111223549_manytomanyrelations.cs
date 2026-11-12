using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class manytomanyrelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
            name: "FK_quizzes_AspNetUsers_UploaderId",
            table: "quizzes");

            migrationBuilder.DropForeignKey(
                name: "FK_onlineMeetings_AspNetUsers_UploaderId",
                table: "onlineMeetings");

            migrationBuilder.DropForeignKey(
                name: "FK_lessons_AspNetUsers_UploaderId",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_assignments_AspNetUsers_UploaderId",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "IX_quizzes_UploaderId",
                table: "quizzes");

            migrationBuilder.DropIndex(
                name: "IX_onlineMeetings_UploaderId",
                table: "onlineMeetings");

            migrationBuilder.DropIndex(
                name: "IX_lessons_UploaderId",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_assignments_UploaderId",
                table: "assignments");

            migrationBuilder.CreateIndex(
                name: "IX_quizzes_UploaderId",
                table: "quizzes",
                column: "UploaderId");

            migrationBuilder.CreateIndex(
                name: "IX_onlineMeetings_UploaderId",
                table: "onlineMeetings",
                column: "UploaderId");

            migrationBuilder.CreateIndex(
                name: "IX_lessons_UploaderId",
                table: "lessons",
                column: "UploaderId");

            migrationBuilder.CreateIndex(
                name: "IX_assignments_UploaderId",
                table: "assignments",
                column: "UploaderId");

                        migrationBuilder.AddForeignKey(
                name: "FK_quizzes_AspNetUsers_UploaderId",
                table: "quizzes",
                column: "UploaderId",
                principalTable: "aspnetusers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_onlineMeetings_AspNetUsers_UploaderId",
                table: "onlineMeetings",
                column: "UploaderId",
                principalTable: "aspnetusers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_AspNetUsers_UploaderId",
                table: "lessons",
                column: "UploaderId",
                principalTable: "aspnetusers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_assignments_AspNetUsers_UploaderId",
                table: "assignments",
                column: "UploaderId",
                principalTable: "aspnetusers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);    
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_quizzes_UploaderId",
                table: "quizzes");

            migrationBuilder.DropIndex(
                name: "IX_onlineMeetings_UploaderId",
                table: "onlineMeetings");

            migrationBuilder.DropIndex(
                name: "IX_lessons_UploaderId",
                table: "lessons");

            migrationBuilder.DropIndex(
                name: "IX_assignments_UploaderId",
                table: "assignments");

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
        }
    }
}
