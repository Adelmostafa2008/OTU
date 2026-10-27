import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const getDaysLeft = (dateString) => {
  if (!dateString) return null;
  const eventDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(eventDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  const [meeting, setMeeting] = useState(location.state?.meeting || null);
  const [loading, setLoading] = useState(!location.state?.meeting);

  const dummyMeeting = {
    id: id || "m1",
    title: "Office Hours",
    date: "2026-10-29T14:00",
    meetingDate: "2026-10-29T14:00",
    OnlineMeetingDate: "2026-10-29T14:00",
    description: "Q&A session",
    notes: "Join via link",
    faculty: "Engineering",
    division: "A",
    subject: "Computer Science",
    year: "2nd Year",
    semester: "Fall",
  };

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        setLoading(true);
        // URL left empty as requested
        const response = await api.get("", { params: { id } });
        if (response.data) {
          setMeeting(response.data);
        } else if (!meeting) {
          setMeeting(dummyMeeting);
        }
      } catch (err) {
        if (!meeting) {
          setMeeting(dummyMeeting);
        }
      } finally {
        setLoading(false);
      }
    };

    if (!meeting) {
      fetchMeeting();
    } else {
      setLoading(false);
    }
  }, [id]);

  const canEdit = user && (user.role === "admin" || user.role === "instructor");

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this online meeting?");
    if (!confirmed) return;

    try {
      // URL left empty as requested
      await api.delete("", { data: { id } });
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
    navigate(`/meeting/${id}/edit`, { state: { meeting: meeting || dummyMeeting } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  const data = meeting || dummyMeeting;
  const title = data.title || data.name || "Untitled Meeting";
  const date = data.date || data.meetingDate || data.OnlineMeetingDate || "";
  const daysLeft = getDaysLeft(date);
  const formatted = formatMeetingDateTime(date);
  const description = data.description || data.notes || null;

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
            {title}
          </h1>
          {date ? (
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-base font-medium text-gray-700">{formatted?.formattedDate}</div>
                <div className="text-sm text-gray-600">at {formatted?.formattedTime}</div>
              </div>
              {daysLeft !== null ? (
                <p className="m-0 mt-1 text-sm font-semibold" style={{ color: 'var(--color-brand-primary)' }}>{daysLeft} day{daysLeft !== 1 ? 's' : ''} left</p>
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
        <div>
          <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700">Description/Notes</h2>
          <p className="m-0 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{description || "No Description Assigned"}</p>
        </div>
        {data.faculty ? (
          <div>
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700">Faculty</h2>
            <p className="m-0 text-sm text-gray-600">{data.faculty}</p>
          </div>
        ) : null}
        {data.division ? (
          <div>
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700">Division</h2>
            <p className="m-0 text-sm text-gray-600">{data.division}</p>
          </div>
        ) : null}
        {data.subject ? (
          <div>
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700">Subject</h2>
            <p className="m-0 text-sm text-gray-600">{data.subject}</p>
          </div>
        ) : null}
        {data.year ? (
          <div>
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700">Year</h2>
            <p className="m-0 text-sm text-gray-600">{data.year}</p>
          </div>
        ) : null}
        {data.semester ? (
          <div>
            <h2 className="m-0 mb-1 text-sm font-semibold text-gray-700">Semester</h2>
            <p className="m-0 text-sm text-gray-600">{data.semester}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MeetingDetailsPage;
