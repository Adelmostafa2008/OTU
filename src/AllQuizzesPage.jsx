import { useNavigate } from "react-router-dom";

const AllQuizzesPage = () => {
  const navigate = useNavigate();
  const quizzes = [
    {
      id: "q1",
      title: "Midterm Exam",
      date: "2026-11-05",
      description: "Covers chapters 1-4",
      faculty: "Engineering",
      division: "A",
      subject: "Computer Science",
      year: "2nd Year",
      semester: "Fall",
      notes: "Bring calculator",
    },
    {
      id: "q2",
      title: "Quiz 1",
      date: "2026-10-28",
      description: null,
      faculty: "Engineering",
      division: "B",
      subject: "Mathematics",
      year: "1st Year",
      semester: "Fall",
      notes: null,
    },
    {
      id: "q3",
      title: "Lab Quiz",
      date: "2026-11-10",
      description: "Practical based quiz",
    },
    {
      id: "q4",
      title: "Final Practice",
      date: "2026-12-01",
      description: "Mock exam",
    },
    {
      id: "q5",
      title: "Pop Quiz",
      date: "2026-10-30",
      description: null,
    },
    {
      id: "q6",
      title: "Extra Quiz",
      date: "2026-12-05",
      description: "Additional assessment",
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Quizzes/Exams
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">All quizzes and exams</p>
      </div>

      <div className="max-w-3xl space-y-2">
        {quizzes.map((item) => {
          const id = item.id || item._id;
          const title = item.title || item.name || "Untitled Quiz";
          const date = item.date || item.quizDate || item.QuizDate || "";
          const description = item.description || item.notes || null;

          return (
            <button
              key={id}
              onClick={() => navigate(`/quiz/${id}`, { state: { quiz: item } })}
              className="w-full text-left bg-white border border-gray-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]"
            >
              <div className="flex-1">
                <span className="text-sm sm:text-base font-semibold text-gray-900">{title}</span>
                {description ? (
                  <p className="m-0 text-xs sm:text-sm text-gray-600 leading-relaxed mt-1">{description}</p>
                ) : null}
              </div>
              {date ? <span className="text-xs text-gray-500 whitespace-nowrap">{date}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AllQuizzesPage;
