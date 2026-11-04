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
  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString(undefined, options);
  const formattedTime = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" });
  return { formattedDate, formattedTime };
};

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        const userId = user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";
        const response = await api.get(`/OnlineMeeting/single/${id}?user_id=${userId}`);
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
    const confirmed = window.confirm("Are you sure you want to delete this online meeting?");
    if (!confirmed) return;

    try {
      await api.delete(`/OnlineMeeting/${id}`);
      ShowSnackBar("Deleted successfully.", "success");
      navigate("/");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        null;
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
      <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
        <div className="text-sm text-gray-500">Meeting not found.</div>
      </div>
    );
  }
  const title = data.title || data.name || "Untitled Meeting";
  const date = data.date || data.meetingDate || data.OnlineMeetingDate || "";
  const daysLeft = getDaysLeft(date);
  const formatted = formatMeetingDateTime(date);
  const description = data.description || data.notes || null;

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight truncate">
            {title}
          </h1>
          {date ? (
            <div className="flex flex-col gap-1">
              {formatted ? (
                <>
                  <p className="m-0 mt-2 text-base font-medium text-gray-700">{formatted.formattedDate}</p>
                  {formatted.formattedTime ? (
                    <p className="m-0 text-sm text-gray-600">at {formatted.formattedTime}</p>
                  ) : null}
                </>
              ) : (
                <p className="m-0 mt-2 text-base font-medium text-gray-700">{date}</p>
              )}
              {daysLeft !== null ? (
                <p className="m-0 text-sm font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
                  {daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        {canEdit ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 px-3.5 py-2.5"
              aria-label="Edit"
            >
              <FiEdit2 size={16} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-300 bg-white text-red-600 font-semibold text-sm cursor-pointer transition-colors hover:bg-red-50 px-3.5 py-2.5"
              aria-label="Delete"
            >
              <FiTrash2 size={16} />
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] space-y-4">
        <div className="min-w-0">
          <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700 max-w-[50%] truncate">Description/Notes</h2>
          <p className="m-0 text-sm text-gray-600 leading-relaxed whitespace-normal break-words w-full">{description || "No Description Assigned"}</p>
        </div>
        {data.faculty ? (
          <div className="min-w-0">
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700 max-w-[50%] truncate">Faculty</h2>
            <p className="m-0 text-sm text-gray-600 whitespace-normal break-words w-full">{data.faculty}</p>
          </div>
        ) : null}
        {data.division ? (
          <div className="min-w-0">
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700 max-w-[50%] truncate">Division</h2>
            <p className="m-0 text-sm text-gray-600 whitespace-normal break-words w-full">{data.division}</p>
          </div>
        ) : null}
        {data.subject ? (
          <div className="min-w-0">
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700 max-w-[50%] truncate">Subject</h2>
            <p className="m-0 text-sm text-gray-600 whitespace-normal break-words w-full">{data.subject}</p>
          </div>
        ) : null}
        {data.year ? (
          <div className="min-w-0">
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700 max-w-[50%] truncate">Year</h2>
            <p className="m-0 text-sm text-gray-600 whitespace-normal break-words w-full">{data.year}</p>
          </div>
        ) : null}
        {data.semester ? (
          <div className="min-w-0">
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700 max-w-[50%] truncate">Semester</h2>
            <p className="m-0 text-sm text-gray-600 whitespace-normal break-words w-full">{data.semester}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
