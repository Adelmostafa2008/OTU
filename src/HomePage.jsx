import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuizExamCard from "./QuizExamCard";
import OnlineMeetingCard from "./OnlineMeetingCard";
import LessonCard from "./LessonCard";
import { LessonCardSkeleton } from "./Skeleton";
import api from "./AxiosHelper";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useAuth } from "./AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [lessons, setLessons] = useState([]);
  const scrollContainerRef = useRef(null);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    if (loading || !user) return;
    const fetchLessons = async () => {
      setLoadingLessons(true);
      try {
        const userId = user?.id || user?.userId || user?._id;
        let response;
        if (userId !== undefined && userId !== null && userId !== "") {
          response = await api.get(`/Student/getlatest/${userId}`,);
        } else {
          response = await api.get("/Student/getlatest");
        }
        const lessonData = response?.data;
        if (!lessonData || (Array.isArray(lessonData) && lessonData.length === 0)) {
          setLessons([]);
          setShowSeeMore(false);
          return;
        }
        const data = Array.isArray(lessonData) ? lessonData : lessonData ? [lessonData] : [];
        setLessons(data);
        setShowSeeMore(Array.isArray(data) && data.length >= 5);
        setTimeout(() => {
          checkScroll();
        }, 100);
      } catch (err) {
        setLessons([]);
        setShowSeeMore(false);
      } finally {
        setLoadingLessons(false);
      }
    };

    fetchLessons();
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const userId = user?.id || user?.userId || user?._id; 
        let res;
        if (userId !== undefined && userId !== null && userId !== "") {
          res = await api.get(`/Quizzes/${userId}`);
        } else {
          res = await api.get("/Quizzes");
        }
        const quizData = res?.data;
        if (!quizData || (Array.isArray(quizData) && quizData.length === 0)) {
          setQuizzes([]);
          return;
        }
        const data = Array.isArray(quizData) ? quizData : quizData ? [quizData] : [];
        setQuizzes(data);
      } catch (err) {
        setQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    const fetchMeetings = async () => {
      setLoadingMeetings(true);
      try {
        const userId = user?.id || user?.userId || user?._id;
        let res;
        if (userId !== undefined && userId !== null && userId !== "") {
          res = await api.get(`/OnlineMeeting/${userId}`);
        } else {
          res = await api.get("/OnlineMeeting");
        }
        const meetingData = res?.data;
        if (!meetingData || (Array.isArray(meetingData) && meetingData.length === 0)) {
          setMeetings([]);
          return;
        }
        const data = Array.isArray(meetingData) ? meetingData : meetingData ? [meetingData] : [];
        setMeetings(data);
      } catch (err) {
        setMeetings([]);
      } finally {
        setLoadingMeetings(false);
      }
    };

    fetchMeetings();
  }, [user, loading]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1
    );
  };

  const handleScroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    if (direction === "left" && !canScrollLeft) return;
    if (direction === "right" && !canScrollRight) return;
    const scrollAmount = 320;
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
    setTimeout(() => {
      checkScroll();
    }, 300);
  };

  const handleSeeMore = () => {
    navigate("/subjects");
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [lessons]);

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-[50%] truncate">
          Dashboard
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Your overview at a glance.
        </p>
      </div>

      <div className="mb-8 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 max-w-[50%] truncate">
          Newest Lesson Uploads
        </h2>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => handleScroll("left")}
            className={`flex-shrink-0 p-2 rounded-full border border-gray-300 bg-white transition-colors ${canScrollLeft ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            aria-label="Previous lessons"
            disabled={!canScrollLeft}
          >
            <FiChevronLeft size={20} />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex-1 w-full overflow-x-auto overflow-y-hidden flex gap-4 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loadingLessons ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`lesson-skeleton-${index}`}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64"
                >
                  <LessonCardSkeleton />
                </div>
              ))
            ) : lessons.length > 0 ? (
              lessons.map((lesson) => (
                <div
                  key={lesson.id || lesson._id}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64"
                >
                  <LessonCard
                    image={lesson?.image}
                    title={lesson?.title}
                    subject={lesson?.subject}
                    description={lesson?.notes}
                  />
                </div>
              ))
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 text-sm">
                No lessons available
              </div>
            )}
            {showSeeMore && lessons.length >= 5 && (
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
            className={`flex-shrink-0 p-2 rounded-full border border-gray-300 bg-white transition-colors ${canScrollRight ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            aria-label="Next lessons"
            disabled={!canScrollRight}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <QuizExamCard quizzes={quizzes || []} loading={loadingQuizzes} />
        <OnlineMeetingCard meetings={meetings || []} loading={loadingMeetings} />
      </div>
    </div>
  );
};

export default HomePage;
