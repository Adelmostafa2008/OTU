import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { DetailPageSkeleton } from "./Skeleton";
import DetailShell, { SectionHeading } from "./DetailShell";
import {
  getContentField,
  getCountdown,
  getDetailDocuments,
  hasFieldValue,
} from "./detailUtils";
import {
  GUEST_ACTION_MESSAGE,
  GUEST_DOWNLOAD_MESSAGE,
  getGuestMeeting,
} from "./props";
import { FiEdit2, FiTrash2, FiVideo, FiExternalLink } from "react-icons/fi";

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

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const showSnackRef = useRef(ShowSnackBar);
  const coolRef = useRef(false);

  useEffect(() => {
    showSnackRef.current = ShowSnackBar;
  }, [ShowSnackBar]);

  const handelSnack = (msg, ty) => {
    if (coolRef.current) return;
    coolRef.current = true;
    showSnackRef.current(msg, ty);
    setTimeout(() => {
      coolRef.current = false;
    }, 5000);
  };

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) return;

    let cancelled = false;
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/Student/meeting/single/${id}?user_id=${getUserId(user)}`
        );
        if (!cancelled) setMeeting(response?.data || null);
      } catch {
        if (!cancelled) setMeeting(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMeeting();
    return () => {
      cancelled = true;
    };
  }, [id, user, isGuest]);

  const blockGuest = () => {
    handelSnack(GUEST_ACTION_MESSAGE, "warn");
  };
  const blockGuestDownload = () => handelSnack(GUEST_DOWNLOAD_MESSAGE, "warn");

  const handleDelete = async () => {
    if (isGuest) {
      blockGuest();
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this online meeting?");
    if (!confirmed) return;

    try {
      const res = await api.delete(`/OnlineMeeting/${id}`);
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
    navigate(`/meeting/${id}/edit`, { state: { meeting } });
  };

  if (loading && !isGuest) {
    return <DetailPageSkeleton />;
  }

  const data = isGuest ? getGuestMeeting(id) : meeting;
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white border rounded-2xl px-6 py-10 text-sm text-gray-500 text-center"
          style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
        >
          Meeting not found.
        </div>
      </div>
    );
  }

  const title = data.title || data.name || "Untitled Meeting";
  const date =
    data.meetingdate ||
    data.meetingDate ||
    data.OnlineMeetingDate ||
    data.date ||
    "";
  const agenda = data.agenda || null;
  const description = data.description || null;
  const uploader =
    data.uploadername || data.uplodername || data.uploaderName || null;
  const isCreator = getIsCreator(data);
  const documents = getDetailDocuments(data);
  const countdown = getCountdown(date, "start");
  const joinUrl =
    data.joinlink || data.joinLink || data.link || data.meetingLink || "";
  const meetingText = getContentField(data, [
    "text",
    "meetingtext",
    "uploadtext",
    "contenttext",
  ]);
  const hasText = hasFieldValue(meetingText);

  const handleJoin = () => {
    if (isGuest) {
      blockGuest();
      return;
    }
    if (joinUrl) window.open(joinUrl, "_blank", "noopener,noreferrer");
  };

  const meta = [
    { label: "Faculty", value: data.faculty },
    { label: "Division", value: data.division },
    { label: "Subject", value: data.subject },
    { label: "Year", value: data.year },
    { label: "Semester", value: data.semester },
    data.durationminutes
      ? { label: "Duration", value: `${data.durationminutes} min` }
      : null,
  ].filter((item) => item && item.value !== undefined && item.value !== null && item.value !== "");

  return (
    <DetailShell
      kind="Online Meeting"
      KindIcon={FiVideo}
      title={title}
      uploader={uploader}
      date={date}
      dateLabel="Scheduled"
      countdown={countdown}
      badge={data.platform || null}
      meta={meta}
      guest={isGuest}
      documents={documents}
      text={hasText ? meetingText : null}
      textLabel="Meeting content"
      onGuestAction={blockGuest}
      onGuestDownload={blockGuestDownload}
      notes={data.notes || null}
      actions={
        isCreator ? (
          <>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl border bg-white text-gray-900 font-semibold text-sm cursor-pointer px-3.5 py-2.5 shadow-sm transition-colors hover:bg-gray-50"
              style={{ borderColor: "var(--color-border-primary)" }}
              aria-label="Edit meeting"
            >
              <FiEdit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-300 bg-white text-red-600 font-semibold text-sm cursor-pointer px-3.5 py-2.5 shadow-sm transition-colors hover:bg-red-50"
              aria-label="Delete meeting"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </>
        ) : null
      }
    >
      {agenda || description ? (
        <section className="space-y-3">
          <SectionHeading
            icon={FiVideo}
            title={agenda ? "Agenda" : "Description"}
          />
          <p className="m-0 text-sm sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-left">
            {agenda || description}
          </p>
        </section>
      ) : null}

      {joinUrl ? (
        <section className="space-y-4">
          <SectionHeading icon={FiVideo} title="Join link" />
          <button
            type="button"
            onClick={handleJoin}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#7c9b36] cursor-pointer"
            style={{ backgroundColor: "#91b141" }}
          >
            <FiExternalLink size={15} />
            Join meeting
          </button>
        </section>
      ) : null}
    </DetailShell>
  );
};

export default MeetingDetailsPage;
