import QuizExamCard from "./QuizExamCard";
import OnlineMeetingCard from "./OnlineMeetingCard";

const HomePage = () => {
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
          Dashboard
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Your overview at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QuizExamCard quizzes={quizzes} />
        <OnlineMeetingCard meetings={meetings} />
      </div>
    </div>
  );
};

export default HomePage;
