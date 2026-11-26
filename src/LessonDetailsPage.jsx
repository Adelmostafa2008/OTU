import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { DetailPageSkeleton } from "./Skeleton";
import DetailShell from "./DetailShell";
import { getContentField, getDetailDocuments, hasFieldValue } from "./detailUtils";
import {
  GUEST_ACTION_MESSAGE,
  GUEST_DOWNLOAD_MESSAGE,
  getGuestLesson,
} from "./props";
import { FiBookOpen, FiEdit2, FiTrash2 } from "react-icons/fi";

const getUserId = (user) =>
  user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";

const getIsCreator = (item) => {
  const flag =
    item?.iscreator ?? item?.isCreator ?? item?.IsCreator ?? item?.Iscreator;
  return flag === true || flag === 1 || flag === "true";
};

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof err?.plainMessage === "string" && err.plainMessage.trim())
    return err.plainMessage.trim();
  if (typeof err?.message === "string" && err.message.trim()) return err.message.trim();
  if (data && typeof data === "object") {
    const direct = data.message ?? data.error ?? data.msg ?? data.title ?? data.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    if (data.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).flat().find((item) => item);
      if (first) return String(first);
    }
  }
  if (err?.code === "ERR_NETWORK" || (!err?.response && err?.request)) {
    return "Network error. Please check your connection and try again.";
  }
  return fallback;
};

const getSuccessMessage = (res, fallback) => {
  const data = res?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof res?.plainMessage === "string" && res.plainMessage.trim())
    return res.plainMessage.trim();
  if (typeof res?.message === "string" && res.message.trim()) return res.message.trim();
  if (data && typeof data === "object") {
    const direct = data.message ?? data.msg ?? data.title ?? data.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
  }
  return fallback;
};

const getUploaderDisplayName = (item) => {
  const fullName = item?.uploadername ?? item?.uplodername ?? item?.uploaderName;
  if (typeof fullName !== "string") return null;
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return null;
  return parts.slice(0, 2).join(" ");
};

const LessonDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const showSnackRef = useRef(ShowSnackBar);
  const coolRef = useRef(false);

  useEffect(() => {
    showSnackRef.current = ShowSnackBar;
  }, [ShowSnackBar]);

  const handelSnack = useCallback((msg, ty) => {
    if (!coolRef.current) {
      coolRef.current = true;
      showSnackRef.current(msg, ty);
      setTimeout(() => {
        coolRef.current = false;
      }, 5000);
    }
  }, []);

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) return;

    let cancelled = false;
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const userId = getUserId(user);
        const response = await api.get(`student/lesson/${id}?userid=${userId}`);
        console.log(response.data);
        
        if (cancelled) return;
        setLesson(response?.data || null);
      } catch (err) {
        if (!cancelled) {
          setLesson(null);
          handelSnack(getErrorMessage(err, "Failed to load lesson."), "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLesson();
    return () => {
      cancelled = true;
    };
  }, [id, user, isGuest, handelSnack]);

  const blockGuest = () => handelSnack(GUEST_ACTION_MESSAGE, "warn");
  const blockGuestDownload = () => handelSnack(GUEST_DOWNLOAD_MESSAGE, "warn");

  const handleDelete = async () => {
    if (isGuest) {
      blockGuest();
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirmed) return;
    try {
      const res = await api.delete(`/Upload/${id}`);
      handelSnack(getSuccessMessage(res, "Deleted successfully."), "success");
      navigate("/");
    } catch (err) {
      handelSnack(getErrorMessage(err, "Failed to delete."), "error");
    }
  };

  const handleEdit = () => {
    if (isGuest) {
      blockGuest();
      return;
    }
    navigate(`/lesson/${id}/edit`, { state: { lesson } });
  };

  if (loading && !isGuest) {
    return <DetailPageSkeleton />;
  }

  const data = isGuest ? getGuestLesson(id) : lesson;
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white border rounded-2xl px-6 py-10 text-sm text-gray-500 text-center"
          style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
        >
          Lesson not found.
        </div>
      </div>
    );
  }

  const title = data.title || data.name || "Untitled Lesson";
  const notes = data.notes ?? null;
  const lessonLink = getContentField(data, ["link", "lessonlink", "uploadlink", "contentlink"]);
  const lessonText = getContentField(data, ["text", "lessontext", "uploadtext", "contenttext"]);
  const hasLink = hasFieldValue(lessonLink);
  const hasText = hasFieldValue(lessonText);
  const uploaderDisplayName = getUploaderDisplayName(data);
  const isCreator = getIsCreator(data);
  const documents = getDetailDocuments(data);

  const lessonDate =
    data.uploaddate ||
    data.UploadDate ||
    data.uploadedon ||
    data.createdate ||
    data.date ||
    "";
  const badge =
    data.type ??
    data.Type ??
    data.lessonType ??
    data.LessonType ??
    data.lesson_type ??
    data.kind;
  const meta = [
    { label: "Faculty", value: data.faculty },
    { label: "Division", value: data.division },
    { label: "Subject", value: data.subject },
    { label: "Year", value: data.year },
    { label: "Semester", value: data.semester },
  ].filter(
    (item) => item.value !== undefined && item.value !== null && item.value !== "",
  );

  return (
    <DetailShell
      kind="Lesson"
      KindIcon={FiBookOpen}
      title={title}
      uploader={uploaderDisplayName}
      date={lessonDate}
      dateLabel="Uploaded"
      badge={badge || null}
      meta={meta}
      guest={isGuest}
      documents={documents}
      link={hasLink ? lessonLink : null}
      text={hasText ? lessonText : null}
      textLabel="Lesson content"
      onGuestAction={blockGuest}
      onGuestDownload={blockGuestDownload}
      notes={notes}
      actions={
        isCreator ? (
          <>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl border bg-white text-gray-900 font-semibold text-sm cursor-pointer px-3.5 py-2.5 shadow-sm transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--color-border-primary)" }}
              aria-label="Edit lesson"
            >
              <FiEdit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-300 bg-white text-red-600 font-semibold text-sm cursor-pointer px-3.5 py-2.5 shadow-sm transition-colors hover:bg-red-50"
              aria-label="Delete lesson"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </>
        ) : null
      }
    />
  );
};

export default LessonDetailsPage;
