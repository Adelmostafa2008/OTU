import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuizExamCard from "./QuizExamCard";
import OnlineMeetingCard from "./OnlineMeetingCard";
import LessonCard from "./LessonCard";
import api from "./AxiosHelper";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const HomePage = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const scrollContainerRef = useRef(null);
  const [showSeeMore, setShowSeeMore] = useState(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Make request as specified with empty URL
        const response = await api.get("");
        const lessonData = response?.data || [];
        // Get newest 5 lessons
        const newestLessons = Array.isArray(lessonData) ? lessonData.slice(-5).reverse() : [];
        setLessons(newestLessons.length > 0 ? newestLessons : getDummyLessons());
      } catch (err) {
        // Use dummy data for now
        setLessons(getDummyLessons());
      }
    };

    fetchLessons();
  }, []);

  const getDummyLessons = () => {
    return [
      {
        id: "l1",
        title: "Introduction to React Hooks",
        subject: "Computer Science",
        description: "Learn the basics of useState, useEffect, and custom hooks in React.",
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
        createdAt: "2026-10-27T10:00:00Z",
      },
      {
        id: "l2",
        title: "Calculus I - Limits and Continuity",
        subject: "Mathematics",
        description: null,
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=400&fit=crop",
        createdAt: "2026-10-26T14:30:00Z",
      },
      {
        id: "l3",
        title: "Data Structures: Arrays and Linked Lists",
        subject: "Computer Science",
        description: "A comprehensive guide to understanding arrays, linked lists, and their time complexities with practical examples.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
        createdAt: "2026-10-25T09:15:00Z",
      },
      {
        id: "l4",
        title: "Newton's Laws of Motion",
        subject: "Physics",
        description: "Understanding the three laws of motion and their applications in real world scenarios.",
        image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop",
        createdAt: "2026-10-24T16:45:00Z",
      },
      {
        id: "l5",
        title: "Shakespearean Tragedies Overview",
        subject: "English Literature",
        description: "Exploring the major themes and characters in Hamlet, Macbeth, and Othello.",
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop",
        createdAt: "2026-10-23T11:20:00Z",
      },
    ];
  };

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 320; // approximate card width + gap
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
      // Check if scrolled to near end
      setTimeout(() => {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          setShowSeeMore(true);
        }
      }, 300);
    }
  };

  const handleSeeMore = () => {
    navigate("/subjects");
  };

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

      {/* Newest Lesson Uploads Section */}
      <div className="mb-8 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Newest Lesson Uploads</h2>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => handleScroll("left")}
            className="flex-shrink-0 p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Previous lessons"
          >
            <FiChevronLeft size={20} />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex-1 w-full overflow-x-auto overflow-y-hidden flex gap-4 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {lessons.length > 0 ? (
              lessons.map((lesson) => (
                <div key={lesson.id} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64">
                  <LessonCard
                    image={lesson?.image}
                    title={lesson?.title}
                    subject={lesson?.subject}
                    description={lesson?.description}
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 text-sm">
                No lessons available
              </div>
            )}
            {showSeeMore && lessons.length > 0 && (
              <div className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl">
                <button
                  onClick={handleSeeMore}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  see more
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleScroll("right")}
            className="flex-shrink-0 p-2 rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            aria-label="Next lessons"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QuizExamCard quizzes={quizzes} />
        <OnlineMeetingCard meetings={meetings} />
      </div>
    </div>
  );
};

export default HomePage;
