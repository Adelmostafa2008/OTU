import { useNavigate } from "react-router-dom";

const getDaysLeft = (dateString) => {
  if (!dateString) return null;
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(eventDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const QuizExamCard = ({ quizzes = [] }) => {
  const navigate = useNavigate();
  const displayItems = Array.isArray(quizzes) ? quizzes.slice(0, 5) : [];

  return (
    <article className="bg-white border-gray-200 rounded-xl overflow-hidden w-full shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] transition-[transform,box-shadow]">
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="m-0 text-sm sm:text-base font-bold text-gray-900 leading-snug">
          Quizzes/Exams
        </h3>
      </div>

      <div className="space-y-2 p-3">
        {displayItems.map((item, index) => {
          const id = item.id || item._id || index;
          const title = item.title || item.name || "Untitled Quiz";
          const date = item.date || item.quizDate || item.QuizDate || item.createdAt || "";
          const daysLeft = getDaysLeft(date);

          return (
            <button
              key={id}
              onClick={() => navigate(`/quiz/${id}`, { state: { quiz: item } })}
              className="w-full text-left bg-white border border-gray-200 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              <span className="text-sm font-medium text-gray-900 text-left">{title}</span>
              <div className="text-right">
                {date ? (
                  <div className="text-xs text-gray-500 whitespace-nowrap">{date}</div>
                ) : (
                  <div className="text-xs text-gray-500">No date</div>
                )}
                {daysLeft !== null ? (
                  <div className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-brand-primary)' }}>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left</div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {Array.isArray(quizzes) && quizzes.length > 5 ? (
        <div className="px-4 py-3 sm:px-5 sm:py-3.5">
          <button
            onClick={() => navigate("/quizzes")}
            className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 px-3.5 py-2.5"
          >
            Show all
          </button>
        </div>
      ) : null}
    </article>
  );
};

export default QuizExamCard;