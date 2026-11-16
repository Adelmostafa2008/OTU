import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuizExamCard from "./QuizExamCard";
import OnlineMeetingCard from "./OnlineMeetingCard";
import AssignmentCard from "./AssignmentCard";
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
  const [assignments, setAssignments] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  const isGuest = String(user?.role ?? "").toLowerCase() === "guest";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    const fetchLessons = async () => {
      setLoadingLessons(true);
      try {
        const userId = user?.id || user?.userId || user?._id;
        let response;
        if (userId !== undefined && userId !== null && userId !== "") {
          response = await api.get(`/Student/getlatest/${userId}`, { timeout: 15000 });
        }
        if (cancelled) return;
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
          if (!cancelled) checkScroll();
        }, 100);
      } catch (err) {
        if (!cancelled) {
          setLessons([]);
          setShowSeeMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoadingLessons(false);
        }
      }
    };

    fetchLessons();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const userId = user?.id || user?.userId || user?._id;
        let res;
        if (userId !== undefined && userId !== null && userId !== "") {
          res = await api.get(`/Student/quiz/${userId}?IsCard=true`, { timeout: 15000 });
        }
        if (cancelled) return;
        const quizData = res?.data;
        if (!quizData || (Array.isArray(quizData) && quizData.length === 0)) {
          setQuizzes([]);
          return;
        }
        const data = Array.isArray(quizData) ? quizData : quizData ? [quizData] : [];
        setQuizzes(data);
      } catch (err) {
        if (!cancelled) {
          setQuizzes([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingQuizzes(false);
        }
      }
    };

    fetchQuizzes();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    const fetchMeetings = async () => {
      setLoadingMeetings(true);
      try {
        const userId = user?.id || user?.userId || user?._id;
        let res;
        if (userId !== undefined && userId !== null && userId !== "") {
          res = await api.get(`/Student/meeting/${userId}?IsCard=true`, { timeout: 15000 });
        }
        if (cancelled) return;
        const meetingData = res?.data;
        if (!meetingData || (Array.isArray(meetingData) && meetingData.length === 0)) {
          setMeetings([]);
          return;
        }
        const data = Array.isArray(meetingData) ? meetingData : meetingData ? [meetingData] : [];
        setMeetings(data);
      } catch (err) {
        if (!cancelled) {
          setMeetings([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingMeetings(false);
        }
      }
    };

    fetchMeetings();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    const fetchAssignments = async () => {
      setLoadingAssignments(true);
      try {
        const userId = user?.id || user?.userId || user?._id;
        let res;
        if (userId !== undefined && userId !== null && userId !== "") {
          res = await api.get(`/Student/assignment/all/${userId}?IsCard=true`, { timeout: 15000 });
        }
        if (cancelled) return;
        const assignmentData = res?.data;
        if (!assignmentData || (Array.isArray(assignmentData) && assignmentData.length === 0)) {
          setAssignments([]);
          return;
        }
        const data = Array.isArray(assignmentData) ? assignmentData : assignmentData ? [assignmentData] : [];
        setAssignments(data);
      } catch (err) {
        if (!cancelled) {
          setAssignments([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingAssignments(false);
        }
      }
    };

    fetchAssignments();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
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
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Dashboard
          </h1>
          <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
            Your overview at a glance.
          </p>
        </div>
      </div>

      {isGuest && (
        <div
          className="rounded-xl px-4 py-3 sm:px-5 sm:py-4"
          style={{
            backgroundColor: "rgba(251, 191, 36, 0.18)",
            border: "1px solid #f59e0b",
          }}
        >
          <p className="m-0 text-sm sm:text-base font-medium text-amber-600">
            As a guest user you will be authorized to read and preveiw pages only and you can't perform any actions
          </p>
        </div>
      )}

      <section
        className="bg-white border rounded-2xl p-4 sm:p-6"
        style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">
            Newest Lesson Uploads
          </h2>
        </div>
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => handleScroll("left")}
            className={`flex-shrink-0 p-2.5 rounded-full border bg-white transition-all ${canScrollLeft ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            style={{ borderColor: "var(--color-border-primary)" }}
            aria-label="Previous lessons"
            disabled={!canScrollLeft}
          >
            <FiChevronLeft size={20} />
          </button>

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex-1 w-full overflow-x-auto overflow-y-hidden flex gap-4 scroll-smooth [&::-webkit-scrollbar]:hidden py-1"
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
              lessons.map((lesson, i) => (
                <div
                  key={lesson.id || lesson._id || i}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64"
                >
                  <LessonCard
                    image={lesson?.image}
                    title={lesson?.title}
                    subject={lesson?.subject}
                    description={lesson?.notes}
                    type={
                      lesson?.type ??
                      lesson?.Type ??
                      lesson?.lessonType ??
                      lesson?.LessonType ??
                      lesson?.lesson_type ??
                      lesson?.kind
                    }
                    truncateTitle
                    truncateNotes
                  />
                </div>
              ))
            ) : (
              <div
                className="w-full h-64 flex items-center justify-center bg-gray-50 border rounded-2xl text-gray-500 text-sm"
                style={{ borderColor: "var(--color-border-primary)" }}
              >
                No lessons available
              </div>
            )}
            {showSeeMore && lessons.length >= 5 && (
              <div
                className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64 flex items-center justify-center bg-gray-50 border rounded-2xl"
                style={{ borderColor: "var(--color-border-primary)" }}
              >
                <button
                  onClick={handleSeeMore}
                  className="px-6 py-3 bg-white border rounded-xl text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--color-border-primary)" }}
                >
                  See more
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleScroll("right")}
            className={`flex-shrink-0 p-2.5 rounded-full border bg-white transition-all ${canScrollRight ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            style={{ borderColor: "var(--color-border-primary)" }}
            aria-label="Next lessons"
            disabled={!canScrollRight}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <QuizExamCard quizzes={quizzes || []} loading={loadingQuizzes} truncateTitles />
        <AssignmentCard assignments={assignments || []} loading={loadingAssignments} truncateTitles />
        <OnlineMeetingCard meetings={meetings || []} loading={loadingMeetings} truncateTitles />
      </div>
    </div>
  );
};

export default HomePage;
