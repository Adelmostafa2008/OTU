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
import { pickField, toSavedDocs } from "./contentUtils";
import {
  guestAssignments,
  guestLessons,
  guestMeetings,
  guestQuizzes,
} from "./props";
import axios from "axios";

// Preview files live in the same cloud storage as lesson files, so they are
// requested as blobs exactly like LessonDetailsPage does.
const previewClient = axios.create();

const IMAGE_PREVIEW_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg", "avif", "ico"];
const DOCX_PREVIEW_EXTS = ["docx", "doc"];

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

// Documents arrive as descriptors: [{ filename, size, content_type }].
const getLessonDocs = (lesson) => toSavedDocs(pickField(lesson, "files", "docs", "UploadFiles"));

const getDocLabel = (doc) => {
  const name = String(doc?.filename ?? "");
  const dot = name.lastIndexOf(".");
  if (dot >= 0 && dot < name.length - 1) return name.slice(dot + 1).toLowerCase();
  const type = String(doc?.content_type ?? "");
  return type.includes("/") ? type.split("/")[1].toLowerCase() : "";
};

const isImageDoc = (doc) => {
  const type = String(doc?.content_type ?? "");
  return IMAGE_PREVIEW_EXTS.includes(getDocLabel(doc)) || type.startsWith("image/");
};

// Storage urls are sent alongside the descriptors, in the same order.
const getLessonFileUrls = (lesson) => {
  const value = getLessonFieldValue(lesson, ["filesurls", "fileurls", "filesurl"]);
  if (Array.isArray(value)) return value.map(pickUrlValue).filter(Boolean);
  const single = pickUrlValue(value);
  return single ? [single] : [];
};

// The declared tab is authoritative, but older payloads omit it, so fall back
// to the fields that are actually populated. A document lesson must not be
// advertised as text just because it has no preview image.
const getLessonContentKind = (lesson, docs) => {
  const declared = String(
    pickField(lesson, "UploadContentType", "uploadContentType", "upload_content_type") ?? "",
  )
    .trim()
    .toLowerCase();
  if (declared === "document" || declared === "documents") return "file";
  if (declared === "link" || declared === "text") return declared;

  const link = pickUrlValue(getLessonFieldValue(lesson, ["link", "uploadlink", "lessonlink"]));
  if (link) return "link";
  if ((docs ?? getLessonDocs(lesson)).length > 0) return "file";
  const text = pickField(lesson, "text", "UploadText");
  if (text !== null && text !== undefined && String(text).trim() !== "") return "text";
  return "empty";
};

// Only preview sources that can actually render an image are worth fetching:
// every other file would be a full download for a thumbnail that never shows.
const isDocxDoc = (doc) => DOCX_PREVIEW_EXTS.includes(getDocLabel(doc));

// Word documents cannot be shown as an <img>, so they get their own source
// lookup and are rendered with docx-preview instead.
const getLessonDocxPreview = (lesson) => {
  const declared = pickUrlValue(getLessonFieldValue(lesson, PREVIEW_URL_KEYS));
  if (declared && DOCX_PREVIEW_EXTS.includes(getPreviewExt(declared))) {
    return { url: declared, doc: null };
  }

  const docs = getLessonDocs(lesson);
  const urls = getLessonFileUrls(lesson);
  for (let index = 0; index < docs.length; index += 1) {
    if (!isDocxDoc(docs[index])) continue;
    const url = urls[index] || "";
    if (url) return { url, doc: docs[index] };
  }

  const firstUrl = urls[0] || "";
  if (firstUrl && DOCX_PREVIEW_EXTS.includes(getPreviewExt(firstUrl))) {
    return { url: firstUrl, doc: docs[0] ?? null };
  }
  return { url: "", doc: null };
};

const getLessonPreview = (lesson) => {
  const declared = pickUrlValue(getLessonFieldValue(lesson, PREVIEW_URL_KEYS));
  if (declared) return { url: declared, doc: null };

  const docs = getLessonDocs(lesson);
  const urls = getLessonFileUrls(lesson);
  for (let index = 0; index < docs.length; index += 1) {
    if (!isImageDoc(docs[index])) continue;
    const url = urls[index] || "";
    const ext = getPreviewExt(url);
    if (url && (!ext || IMAGE_PREVIEW_EXTS.includes(ext))) {
      return { url, doc: docs[index] };
    }
  }

  const firstUrl = urls[0] || "";
  if (firstUrl && IMAGE_PREVIEW_EXTS.includes(getPreviewExt(firstUrl))) {
    return { url: firstUrl, doc: docs[0] ?? null };
  }
  return { url: "", doc: null };
};

// Returns { status: "image" | "docx" | "unavailable", url?, blob?, sourceUrl, label, isObjectUrl? }
const loadLessonPreview = async (url, label, kind = "auto") => {
  const ext = getPreviewExt(url) || String(label ?? "").toLowerCase();
  if (kind === "docx") {
    try {
      const res = await previewClient.get(url, { responseType: "blob", timeout: 20000 });
      if (res.data instanceof Blob) {
        return {
          status: "docx",
          blob: res.data,
          sourceUrl: url,
          label: ext || "docx",
        };
      }
      return { status: "unavailable", sourceUrl: url, label: ext || "docx" };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`[lesson preview] FAILED ${url}`, error);
      }
      return { status: "unavailable", sourceUrl: url, label: ext || "docx" };
    }
  }
  // A known non-image extension never needs the bytes.
  if (ext && !IMAGE_PREVIEW_EXTS.includes(ext)) {
    return { status: "unavailable", sourceUrl: url, label: ext };
  }
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

  // Guests never see live data: the dashboard is populated from the sample
  // content in props.js while an account with a real role uses the API.
  const dashboardLessons = isGuest ? guestLessons : lessons;
  const dashboardQuizzes = isGuest ? guestQuizzes : quizzes;
  const dashboardMeetings = isGuest ? guestMeetings : meetings;
  const dashboardAssignments = isGuest ? guestAssignments : assignments;
  const lessonsLoading = !isGuest && loadingLessons;
  const quizzesLoading = !isGuest && loadingQuizzes;
  const meetingsLoading = !isGuest && loadingMeetings;
  const assignmentsLoading = !isGuest && loadingAssignments;

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1,
    );
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
  }, [user, navigate, loading]);

  useEffect(() => {
    if (loading || !user) return;
    if (isGuest) return;
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
          setLessonPreviews({});
          return;
        }
        const data = Array.isArray(lessonData) ? lessonData : lessonData ? [lessonData] : [];
        setLessons(data);
        setShowSeeMore(Array.isArray(data) && data.length >= 5);

        previewUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        previewUrlsRef.current = [];
        const previewItems = data
          .map((item, index) => {
            const key = String(item?.id ?? item?._id ?? index);
            const image = getLessonPreview(item);
            if (image.url) {
              return {
                key,
                url: image.url,
                label: getDocLabel(image.doc),
                kind: "image",
              };
            }
            const docx = getLessonDocxPreview(item);
            if (docx.url) {
              return {
                key,
                url: docx.url,
                label: getDocLabel(docx.doc) || getPreviewExt(docx.url),
                kind: "docx",
              };
            }
            return null;
          })
          .filter(Boolean);
        setLessonPreviews(
          Object.fromEntries(previewItems.map((item) => [item.key, { status: "loading" }])),
        );
        if (previewItems.length > 0) {
          Promise.all(
            previewItems.map(async (item) => [
              item.key,
              await loadLessonPreview(item.url, item.label, item.kind),
            ]),
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
      } catch {
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
  }, [user, loading, isGuest]);

  useEffect(() => {
    if (loading || !user) return;
    if (isGuest) return;
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
      } catch {
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
  }, [user, loading, isGuest]);

  useEffect(() => {
    if (loading || !user) return;
    if (isGuest) return;
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
      } catch {
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
  }, [user, loading, isGuest]);

  useEffect(() => {
    if (loading || !user) return;
    if (isGuest) return;
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
      } catch {
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
  }, [user, loading, isGuest]);

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
  }, [dashboardLessons]);

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
          className="rounded-xl border bg-white px-4 py-3 sm:px-5 sm:py-4"
          style={{
            borderColor: "var(--color-border-primary)",
            borderLeft: "4px solid #91b141",
          }}
        >
          <p className="m-0 text-sm sm:text-base font-medium text-gray-700">
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
            className={`hidden sm:inline-flex flex-shrink-0 p-2.5 rounded-full border bg-white transition-all ${canScrollLeft ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
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
            {lessonsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`lesson-skeleton-${index}`}
                  className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] h-64"
                >
                  <LessonCardSkeleton />
                </div>
              ))
            ) : dashboardLessons.length > 0 ? (
              dashboardLessons.map((lesson, i) => {
                const previewKey = String(lesson?.id ?? lesson?._id ?? i);
                const previewSource = getLessonPreview(lesson);
                const docxSource = getLessonDocxPreview(lesson);
                const preview =
                  lessonPreviews[previewKey] ||
                  (previewSource.url || docxSource.url
                    ? { status: "loading" }
                    : null);
                const fallbackImage =
                  typeof lesson?.image === "string" && lesson.image.trim() !== ""
                    ? lesson.image
                    : "";
                const docs = getLessonDocs(lesson);
                const firstDoc = docs[0] ?? null;
                const contentKind = getLessonContentKind(lesson, docs);
                const previewStatus = preview
                  ? preview.status
                  : fallbackImage
                    ? "image"
                    : "content";
                const previewKind =
                  preview?.status === "docx"
                    ? "file"
                    : contentKind === "empty" && preview
                      ? "file"
                      : contentKind;
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
                      previewLabel={preview?.label || getDocLabel(firstDoc)}
                      previewSource={
                        preview?.sourceUrl ||
                        previewSource.url ||
                        docxSource.url
                      }
                      previewBlob={preview?.status === "docx" ? preview.blob : null}
                      previewFileName={
                        previewSource.doc?.filename ||
                        docxSource.doc?.filename ||
                        firstDoc?.filename ||
                        ""
                      }
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
            {(isGuest || showSeeMore) && dashboardLessons.length >= 5 && (
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
            className={`hidden sm:inline-flex flex-shrink-0 p-2.5 rounded-full border bg-white transition-all ${canScrollRight ? "hover:bg-gray-50 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
            style={{ borderColor: "var(--color-border-primary)" }}
            aria-label="Next lessons"
            disabled={!canScrollRight}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <QuizExamCard
          quizzes={dashboardQuizzes || []}
          loading={quizzesLoading}
          truncateTitles
          readOnly={isGuest}
        />
        <AssignmentCard
          assignments={dashboardAssignments || []}
          loading={assignmentsLoading}
          truncateTitles
          readOnly={isGuest}
        />
        <OnlineMeetingCard
          meetings={dashboardMeetings || []}
          loading={meetingsLoading}
          truncateTitles
          readOnly={isGuest}
        />
      </div>
    </div>
  );
};

export default HomePage;
