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
import axios from "axios";

// Preview files live in the same cloud storage as lesson files, so they are
// requested as blobs exactly like LessonDetailsPage does.
const previewClient = axios.create();

const IMAGE_PREVIEW_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif", "ico"];

const getPreviewExt = (value) => {
  if (typeof value !== "string" || !value) return "";
  let pathname;
  try {
    pathname = new URL(value).pathname;
  } catch {
    pathname = value.split("?")[0].split("#")[0];
  }
  let base = pathname.split("/").pop() || "";
  try {
    base = decodeURIComponent(base);
  } catch {
    // keep the raw name when it is not valid percent-encoding
  }
  const idx = base.lastIndexOf(".");
  return idx < 0 ? "" : base.slice(idx + 1).toLowerCase();
};

// The API has shipped this field both as "previewurl" and as "preveiwurl",
// with inconsistent casing, so match the key the same way every time.
const PREVIEW_URL_KEYS = ["previewurl", "preveiwurl", "previewuri", "preveiwuri"];

const normalizeLessonKey = (key) => String(key).toLowerCase().replace(/[^a-z]/g, "");

const getLessonFieldValue = (lesson, keys) => {
  if (!lesson || typeof lesson !== "object") return undefined;
  const match = Object.keys(lesson).find((key) => keys.includes(normalizeLessonKey(key)));
  return match === undefined ? undefined : lesson[match];
};

const pickUrlValue = (value) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed || lower === "null" || lower === "undefined") return "";
    return trimmed;
  }
  if (Array.isArray(value)) return pickUrlValue(value[0]);
  if (value && typeof value === "object") {
    return pickUrlValue(
      value.url ?? value.Url ?? value.URL ?? value.href ?? value.Href ?? value.path ?? value.Path,
    );
  }
  return "";
};

// A lesson without a preview url has no documents, so its content is either a
// link or a text paragraph; when neither field can be read the paragraph is the
// one that is left, so the card still advertises text content.
const getLessonContentKind = (lesson) => {
  const link = pickUrlValue(getLessonFieldValue(lesson, ["link", "uploadlink", "lessonlink"]));
  if (link) return "link";
  return "text";
};

const getLessonPreviewUrl = (lesson) => pickUrlValue(getLessonFieldValue(lesson, PREVIEW_URL_KEYS));

// Returns { status: "image" | "unavailable", url?, sourceUrl, label, isObjectUrl? }
const loadLessonPreview = async (url) => {
  const ext = getPreviewExt(url);
  if (import.meta.env.DEV) {
    console.info(`[lesson preview] GET ${url}`);
  }
  try {
    const res = await previewClient.get(url, { responseType: "blob", timeout: 20000 });
    const blob = res.data;
    const blobType = typeof blob?.type === "string" ? blob.type : "";
    const isImage = blobType.startsWith("image/") || IMAGE_PREVIEW_EXTS.includes(ext);
    if (import.meta.env.DEV) {
      console.info(`[lesson preview] ${res.status} ${blobType || "unknown type"} <- ${url}`);
    }
    if (isImage && blob instanceof Blob) {
      return {
        status: "image",
        url: URL.createObjectURL(blob),
        sourceUrl: url,
        isObjectUrl: true,
        label: ext || blobType.split("/")[1] || "",
      };
    }
    return { status: "unavailable", sourceUrl: url, label: ext || blobType.split("/")[1] || "" };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[lesson preview] FAILED ${url}`, error);
    }
    // The bucket may be readable by <img> even when the fetch is blocked
    // (CORS), so image files still get a chance to render directly.
    if (IMAGE_PREVIEW_EXTS.includes(ext)) {
      return { status: "image", url, sourceUrl: url, label: ext };
    }
    return { status: "unavailable", sourceUrl: url, label: ext };
  }
};

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
  const [lessonPreviews, setLessonPreviews] = useState({});
  const previewUrlsRef = useRef([]);

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

          console.log(response.data);
          
        }
        if (cancelled) return;
        const lessonData = response?.data;
        if (!lessonData || (Array.isArray(lessonData) && lessonData.length === 0)) {
          setLessons([]);
          setShowSeeMore(false);
          setLessonPreviews({});
          return;
        }
        const data = Array.isArray(lessonData) ? lessonData : lessonData ? [lessonData] : [];
        setLessons(data);
        setShowSeeMore(Array.isArray(data) && data.length >= 5);

        previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        previewUrlsRef.current = [];
        const previewItems = data
          .map((item, index) => ({
            key: String(item?.id ?? item?._id ?? index),
            url: getLessonPreviewUrl(item),
          }))
          .filter((item) => item.url);
        setLessonPreviews(
          Object.fromEntries(previewItems.map((item) => [item.key, { status: "loading" }])),
        );
        if (previewItems.length > 0) {
          Promise.all(
            previewItems.map(async (item) => [item.key, await loadLessonPreview(item.url)]),
          ).then((results) => {
            if (cancelled) {
              results.forEach(([, result]) => {
                if (result?.isObjectUrl) URL.revokeObjectURL(result.url);
              });
              return;
            }
            previewUrlsRef.current = results
              .filter(([, result]) => result?.isObjectUrl)
              .map(([, result]) => result.url);
            setLessonPreviews(Object.fromEntries(results));
          });
        }

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
    return () => {
      previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      previewUrlsRef.current = [];
    };
  }, []);

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
              lessons.map((lesson, i) => {
                const previewKey = String(lesson?.id ?? lesson?._id ?? i);
                const preview =
                  lessonPreviews[previewKey] ||
                  (getLessonPreviewUrl(lesson) ? { status: "loading" } : null);
                const fallbackImage =
                  typeof lesson?.image === "string" && lesson.image.trim() !== ""
                    ? lesson.image
                    : "";
                const previewStatus = preview
                  ? preview.status
                  : fallbackImage
                    ? "image"
                    : "content";
                const previewKind = preview ? "file" : getLessonContentKind(lesson);
                return (
                  <div
                    key={lesson.id || lesson._id || i}
                    className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64 cursor-pointer"
                    onClick={() => navigate(`/lesson/${lesson.id || lesson._id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate(`/lesson/${lesson.id || lesson._id}`);
                    }}
                  >
                    <LessonCard
                      image={
                        preview?.status === "image" && preview.url
                          ? preview.url
                          : fallbackImage
                      }
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
                      previewStatus={previewStatus}
                      previewKind={previewKind}
                      previewLabel={preview?.label || ""}
                      previewSource={preview?.sourceUrl || getLessonPreviewUrl(lesson)}
                      truncateTitle
                      truncateNotes
                    />
                  </div>
                );
              })
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
