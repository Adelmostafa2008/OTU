import { useNavigate } from "react-router-dom";

const AllMeetingsPage = () => {
  const navigate = useNavigate();
  const meetings = [
    {
      id: "m1",
      title: "Office Hours",
      date: "2026-10-29T14:00",
      description: "Q&A session",
      faculty: "Engineering",
      division: "A",
      subject: "Computer Science",
      year: "2nd Year",
      semester: "Fall",
      notes: "Join via link",
    },
    {
      id: "m2",
      title: "Guest Lecture",
      date: "2026-11-03T10:30",
      description: null,
    },
    {
      id: "m3",
      title: "Project Review",
      date: "2026-11-12T16:00",
      description: "Review group projects",
    },
    {
      id: "m4",
      title: "Tutorial Session",
      date: "2026-11-08T09:00",
      description: null,
    },
    {
      id: "m5",
      title: "Exam Discussion",
      date: "2026-11-15T13:00",
      description: "Discuss midterm exam",
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Online Meetings
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">All online meetings</p>
      </div>

      <div className="max-w-3xl space-y-2">
        {meetings.map((item) => {
          const id = item.id || item._id;
          const title = item.title || item.name || "Untitled Meeting";
          const date = item.date || item.meetingDate || item.OnlineMeetingDate || "";
          const description = item.description || item.notes || null;

          return (
            <button
              key={id}
              onClick={() => navigate(`/meeting/${id}`, { state: { meeting: item } })}
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

export default AllMeetingsPage;
