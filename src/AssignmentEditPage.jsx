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

const AssignmentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!location.state?.assignment);

  const [formData, setFormData] = useState(location.state?.assignment || {});
  const [initialData, setInitialData] = useState(location.state?.assignment || {});

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
        let response;
        try {
          const userId = user?.id || user?.userId || user?._id || "";
          response = await api.get(`/assignment/single/${id}?user_id=${userId}`);
        } catch (e) {
          try {
            response = await api.get(`/assignment/${id}`);
          } catch (e2) {
            response = null;
          }
        }
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

    if (!location.state?.assignment) {
      fetchData();
    } else {
      setInitialData(location.state?.assignment || {});
    }
  }, [user, navigate, id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "title" && typeof value === "string") {
      nextValue = value.slice(0, 100);
    } else if (name === "notes" && typeof value === "string") {
      nextValue = value.slice(0, 400);
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === "faculty") {
        next.division = "";
      }
      return next;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    e.preventDefault();
    if (!formData.title?.trim()) {
      ShowSnackBar("Title is required.", "warn");
      return;
    }
    if (String(formData.title).length > 100) {
      ShowSnackBar("Title must be at most 100 characters.", "warn");
      return;
    }
    const notesVal = formData.notes || formData.description || "";
    if (notesVal && String(notesVal).length > 400) {
      ShowSnackBar("Notes must be at most 400 characters.", "warn");
      return;
    }

    const dateVal = getMeetingDateValue();
    if (dateVal) {
      const selectedDate = new Date(dateVal);
      if (!isNaN(selectedDate.getTime())) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (selectedDate < todayStart) {
          ShowSnackBar("Please select today or a future date and time for the assignment.", "warn");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = preparePayload(formData);
      if (dateVal) {
        payload.OnlineMeetingDate = dateVal;
        payload.assignmentDate = dateVal;
        payload.date = dateVal;
      }
      await api.put(`/assignment/${id}`, payload, { withCredentials: true });
      ShowSnackBar("Assignment updated successfully.", "success");
      navigate(`/assignment/${id}`, { state: { assignment: payload } });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ?? err?.response?.data?.error ?? null;
      ShowSnackBar(serverMsg || "Failed to update assignment.", "error");
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
    "w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";
  const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const fieldStyle = { borderColor: "var(--color-border-primary)" };

  const renderSubjects = (id, value) => (
    <select disabled={isGuest} id={id} name="subject" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select subject</option>
      {SUBJECTS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderFaculties = (id, value) => (
    <select disabled={isGuest} id={id} name="faculty" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
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
      <select disabled={isGuest}
        id={id}
        name="division"
        value={value || ""}
        onChange={handleChange}
        className={selectClass}
        style={fieldStyle}
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
    <select disabled={isGuest} id={id} name="year" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderSemesters = (id, value) => (
    <select disabled={isGuest} id={id} name="semester" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select semester</option>
      {SEMESTERS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
  const getMeetingDateValue = () => {
    const raw = formData.deadline || formData.Deadline || formData.OnlineMeetingDate || formData.assignmentDate || formData.meetingDate || formData.date || "";
    if (!raw) return "";

    const toDateTimeLocal = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    if (raw instanceof Date) return toDateTimeLocal(raw);

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return "";
      if (/(Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) {
        return toDateTimeLocal(new Date(trimmed));
      }
      let s = trimmed.replace(" ", "T");
      if (s.includes(".")) s = s.split(".")[0];
      if (s.match(/T\d{2}:\d{2}:\d{2}/)) {
        s = s.replace(/(T\d{2}:\d{2}):\d{2}/, "$1");
      } else if (s.match(/T\d{2}:\d{2}$/)) {
      } else if (s.match(/T\d{2}$/)) {
        s = s + ":00";
      } else if (!s.includes("T") && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return `${s}T00:00`;
      }
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
      return toDateTimeLocal(new Date(trimmed));
    }

    try {
      return toDateTimeLocal(new Date(raw));
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
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Edit Assignment
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">Update assignment details</p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="assignment-title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input readOnly={isGuest} disabled={isGuest}
                  id="assignment-title"
                  name="title"
                  type="text"
                  maxLength={100}
                  value={formData.title || ""}
                  onChange={handleChange}
                  className={inputClass}
                  style={fieldStyle}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="assignment-faculty" className={labelClass}>
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  {renderFaculties("assignment-faculty", formData.faculty)}
                </div>
                <div>
                  <label htmlFor="assignment-division" className={labelClass}>
                    Division <span className="text-red-500">*</span>
                  </label>
                  {renderDivisions("assignment-division", formData.faculty, formData.division)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="assignment-subject" className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {renderSubjects("assignment-subject", formData.subject)}
                </div>
                <div>
                  <label htmlFor="assignment-year" className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  {renderYears("assignment-year", formData.year)}
                </div>
                <div>
                  <label htmlFor="assignment-semester" className={labelClass}>
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {renderSemesters("assignment-semester", formData.semester)}
                </div>
              </div>

              <div>
                <label htmlFor="assignment-date" className={labelClass}>
                  Assignment Date (date and time) <span className="text-red-500">*</span>
                </label>
                <input readOnly={isGuest} disabled={isGuest}
                  id="assignment-date"
                  name="OnlineMeetingDate"
                  type="datetime-local"
                  value={meetingDateValue}
                  onChange={handleChange}
                  className={inputClass}
                  style={fieldStyle}
                  required
                />
              </div>

              <div>
                <label htmlFor="assignment-notes" className={labelClass}>
                  Notes
                </label>
                <textarea readOnly={isGuest} disabled={isGuest}
                  id="assignment-notes"
                  name="notes"
                  maxLength={400}
                  value={formData.notes || formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  style={fieldStyle}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || !isDirty}
                className="px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] py-3"
                style={{
                  backgroundColor: "var(--color-brand-primary)",
                  color: "#ffffff",
                  opacity: isDirty ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (isDirty) e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-brand-primary)";
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 rounded-xl border bg-white font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 py-3"
                style={{ borderColor: "var(--color-border-primary)" }}
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

export default AssignmentEditPage;
