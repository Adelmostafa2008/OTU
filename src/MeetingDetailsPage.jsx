import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { DetailPageSkeleton } from "./Skeleton";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const getDaysLeft = (dateString) => {
  if (!dateString) return null;
  const eventDate = new Date(dateString);
  if (isNaN(eventDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return -1;
  if (diffDays === 0) return 0;
  return diffDays;
};

const formatMeetingDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { formattedDate: dateString, formattedTime: null };
  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString(undefined, options);
  const formattedTime = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" });
  return { formattedDate, formattedTime };
};
const getUploaderDisplayName = (item) => {
  const fullName = item?.uploadername ?? item?.uplodername ?? item?.uploaderName;
  if (typeof fullName !== "string") return null;
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return null;
  return parts.slice(0, 2).join(" ");
};

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const userId = user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";
        const response = await api.get(`/Student/meeting/single/${id}?user_id=${userId}`);
        if (response?.data) {
          setMeeting(response.data);
        } else {
          setMeeting(null);
        }
      } catch (err) {
        setMeeting(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMeeting();
  }, [id, user]);

  const canEdit = user && (user.role === "admin" || user.role === "instructor");

  const handleDelete = async () => {
    if (isGuest) return;
    const confirmed = window.confirm("Are you sure you want to delete this online meeting?");
    if (!confirmed) return;

    try {
      await api.delete(`/OnlineMeeting/${id}`);
      ShowSnackBar("Deleted successfully.", "success");
      navigate("/");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ?? err?.response?.data?.error ?? null;
      ShowSnackBar(serverMsg || "Failed to delete.", "error");
    }
  };

  const handleEdit = () => {
    navigate(`/meeting/${id}/edit`, { state: { meeting: meeting } });
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  const data = meeting;
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
  const date = data.date || data.meetingDate || data.OnlineMeetingDate || "";
  const daysLeft = getDaysLeft(date);
  const formatted = formatMeetingDateTime(date);
  const description = data.description || data.notes || null;
  const uploaderDisplayName = getUploaderDisplayName(data);

  const infoFields = [
    { label: "Description/Notes", value: description || "No description assigned" },
    { label: "Faculty", value: data.faculty },
    { label: "Division", value: data.division },
    { label: "Subject", value: data.subject },
    { label: "Year", value: data.year },
    { label: "Semester", value: data.semester },
  ].filter((f) => f.value !== undefined && f.value !== null && f.value !== "");

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight break-words">
            {title}
          </h1>
          {date ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              {formatted ? (
                <>
                  <p className="m-0 text-base font-medium text-gray-700">
                    {formatted.formattedDate}
                    {formatted.formattedTime ? ` · ${formatted.formattedTime}` : ""}
                  </p>
                </>
              ) : (
                <p className="m-0 text-base font-medium text-gray-700">{date}</p>
              )}
              {daysLeft !== null ? (
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--color-brand-primary)" }}
                >
                  {daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        {canEdit ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl border bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 px-3.5 py-2.5"
              style={{ borderColor: "var(--color-border-primary)" }}
              aria-label="Edit"
            >
              <FiEdit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isGuest}
              className={`flex items-center gap-2 rounded-xl border border-red-300 bg-white text-red-600 font-semibold text-sm cursor-pointer transition-colors hover:bg-red-50 px-3.5 py-2.5 ${isGuest ? "opacity-60 pointer-events-none" : ""}`}
              aria-label="Delete"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <div
        className="bg-white border rounded-2xl p-6 sm:p-8 space-y-5"
        style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
      >
        {uploaderDisplayName && (
          <div className="flex justify-end">
            <div
              className="inline-flex items-center gap-2.5 rounded-full border border-gray-200/80 bg-white/90 pl-2 pr-3.5 py-1.5 shadow-sm backdrop-blur-sm"
              title={`Uploaded by ${uploaderDisplayName}`}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-inner"
                style={{ background: "linear-gradient(135deg, var(--color-brand-primary), #7c3aed)" }}
                aria-hidden="true"
              >
                {uploaderDisplayName.charAt(0).toUpperCase()}
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                  Uploaded by
                </span>
                <span className="text-sm font-semibold text-gray-900 max-w-[10rem] truncate">
                  {uploaderDisplayName}
                </span>
              </span>
            </div>
          </div>
        )}
        {infoFields.map((field) => (
          <div key={field.label} className="min-w-0">
            <h2 className="m-0 mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {field.label}
            </h2>
            <p className="m-0 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-normal break-words w-full">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
