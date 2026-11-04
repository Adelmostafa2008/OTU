import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FormSkeleton } from "./Skeleton";

const SUBJECTS = [
  "Math",
  "Physics",
  "Technical english",
  "Programming",
  "IT essintials",
];

const FACULTIES = [
  "Faculty of Industry and Energy Technology",
  "Faculty of Applied Health Science Technology",
];

const DIVISIONS_BY_FACULTY = {
  "Faculty of Industry and Energy Technology": [
    "IT",
    "Spinning and weaving technology",
    "Food Manufacturing Technology",
    "Railway Technology",
  ],
  "Faculty of Applied Health Science Technology": [
    "Medical Device Technology",
    "Prosthetics and Orthotics Technology",
  ],
};

const YEARS = ["1", "2", "3", "4"];
const SEMESTERS = ["first", "second"];

const OPTIONAL_FIELDS = ["notes", "description"];

const preparePayload = (data) => {
  const payload = {};
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value !== "string") {
      payload[key] = value;
      return;
    }
    const cleaned = value.trim();
    if (cleaned === "" && OPTIONAL_FIELDS.includes(key)) return;
    payload[key] = cleaned;
  });
  return payload;
};

const MeetingEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!location.state?.meeting);

  const [formData, setFormData] = useState(location.state?.meeting || {});
  const [initialData, setInitialData] = useState(location.state?.meeting || {});

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "admin" && user.role !== "instructor") {
      navigate("/", { replace: true });
      return;
    }

    const fetchData = async () => {
      setFetching(true);
      try {
        const response = await api.get(`/OnlineMeeting/${id}`);
        if (response?.data) {
          setFormData(response.data);
          setInitialData(response.data);
        } else {
          setFormData({});
          setInitialData({});
        }
      } catch (err) {
        setFormData({});
        setInitialData({});
      } finally {
        setFetching(false);
      }
    };

    if (!location.state?.meeting) {
      fetchData();
    } else {
      setInitialData(location.state?.meeting || {});
    }
  }, [user, navigate, id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "faculty") {
        next.division = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      ShowSnackBar("Title is required.", "warn");
      return;
    }

    const meetingDateValue = formData.OnlineMeetingDate || formData.meetingDate || formData.date;
    if (meetingDateValue) {
      const selectedDate = new Date(meetingDateValue);
      const now = new Date();
      if (selectedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)) {
        ShowSnackBar("Please select today or a future date and time for the online meeting.", "warn");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = preparePayload(formData);
      const dateVal = getMeetingDateValue();
      if (dateVal) {
        payload.OnlineMeetingDate = dateVal;
        if (!payload.meetingDate) payload.meetingDate = dateVal;
        if (!payload.date) payload.date = dateVal;
      }
      await api.put(`/OnlineMeeting/${id}`, payload, { withCredentials: true });
      ShowSnackBar("Meeting updated successfully.", "success");
      navigate(`/meeting/${id}`, { state: { meeting: payload } });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        null;
      ShowSnackBar(serverMsg || "Failed to update meeting.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "instructor")) {
    return null;
  }

  if (fetching) {
    return <FormSkeleton />;
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20";
  const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  const renderSubjects = (id, value) => (
    <select id={id} name="subject" value={value || ""} onChange={handleChange} className={selectClass} required>
      <option value="">Select subject</option>
      {SUBJECTS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderFaculties = (id, value) => (
    <select id={id} name="faculty" value={value || ""} onChange={handleChange} className={selectClass} required>
      <option value="">Select faculty</option>
      {FACULTIES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderDivisions = (id, faculty, value) => {
    const options = DIVISIONS_BY_FACULTY[faculty] || [];
    return (
      <select
        id={id}
        name="division"
        value={value || ""}
        onChange={handleChange}
        className={selectClass}
        disabled={options.length === 0}
        required
      >
        <option value="">
          {options.length === 0 ? "Select faculty first" : "Select division"}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const renderYears = (id, value) => (
    <select id={id} name="year" value={value || ""} onChange={handleChange} className={selectClass} required>
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderSemesters = (id, value) => (
    <select id={id} name="semester" value={value || ""} onChange={handleChange} className={selectClass} required>
      <option value="">Select semester</option>
      {SEMESTERS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const getMeetingDateValue = () => {
    const raw = formData.OnlineMeetingDate || formData.meetingDate || formData.date || formData.OnlineMeeting_Time || formData.meeting_time || "";
    if (!raw) return "";
    if (typeof raw === "string") {
      let s = raw.replace(" ", "T");
      if (s.includes(".")) s = s.split(".")[0];
      if (s.match(/T\d{2}:\d{2}:\d{2}/)) {
        s = s.replace(/(T\d{2}:\d{2}):\d{2}/, "$1");
      } else if (s.match(/T\d{2}:\d{2}$/)) {
        // already correct
      } else if (s.match(/T\d{2}$/)) {
        s = s + ":00";
      }
      return s;
    }
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const meetingDateValue = getMeetingDateValue();

  const hasChanges = () => {
    const keys = new Set([...Object.keys(formData || {}), ...Object.keys(initialData || {})]);
    for (let key of keys) {
      const current = formData?.[key];
      const initial = initialData?.[key];
      if (typeof current === "string" && typeof initial === "string") {
        if (current.trim() !== initial.trim()) return true;
        continue;
      }
      if (current !== initial) {
        if (current == null && initial == null) continue;
        if (current == null || initial == null) return true;
        if (current !== initial) return true;
      }
    }
    return false;
  };

  const isDirty = hasChanges();

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight w-full">
          Edit Online Meeting
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">Update online meeting details</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
            <div className="space-y-5">
              <div>
                <label htmlFor="meeting-title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="meeting-title"
                  name="title"
                  type="text"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="meeting-faculty" className={labelClass}>
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  {renderFaculties("meeting-faculty", formData.faculty)}
                </div>
                <div>
                  <label htmlFor="meeting-division" className={labelClass}>
                    Division <span className="text-red-500">*</span>
                  </label>
                  {renderDivisions("meeting-division", formData.faculty, formData.division)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="meeting-subject" className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {renderSubjects("meeting-subject", formData.subject)}
                </div>
                <div>
                  <label htmlFor="meeting-year" className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  {renderYears("meeting-year", formData.year)}
                </div>
                <div>
                  <label htmlFor="meeting-semester" className={labelClass}>
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {renderSemesters("meeting-semester", formData.semester)}
                </div>
              </div>

              <div>
                <label htmlFor="meeting-date" className={labelClass}>
                  Online Meeting Date (date and time) <span className="text-red-500">*</span>
                </label>
                <input
                  id="meeting-date"
                  name="OnlineMeetingDate"
                  type="datetime-local"
                  value={meetingDateValue}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="meeting-notes" className={labelClass}>
                  Notes
                </label>
                <textarea
                  id="meeting-notes"
                  name="notes"
                  value={formData.notes || formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={loading || !isDirty}
                className="px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: '#ffffff', opacity: isDirty ? 1 : 0.5 }} onMouseEnter={(e) => { if (isDirty) e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'; }} onMouseLeave={(e) => { e.target.style.backgroundColor = 'var(--color-brand-primary)'; }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 rounded-xl border border-gray-300 bg-white font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingEditPage;

