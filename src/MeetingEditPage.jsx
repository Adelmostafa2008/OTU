import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FormSkeleton } from "./Skeleton";
import ContentSection from "./ContentSection.jsx";
import {
  MEETING_CONTENT_TYPES,
  buildContentPayload,
  pickField,
} from "./contentUtils.js";

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

const asText = (value) => (value === null || value === undefined ? "" : String(value));

// Online meetings never support documents, only a link or text content.
const normalizeContentData = (data = {}) => {
  const declared = asText(
    pickField(data, "UploadContentType", "uploadContentType", "upload_content_type"),
  )
    .trim()
    .toLowerCase();
  const link = asText(pickField(data, "UploadLink", "link"));
  const text = asText(pickField(data, "UploadText", "text"));
  const type = declared === "text" || text ? "text" : "link";
  const semester = asText(pickField(data, "semester")).trim().toLowerCase();

  // Responses mix casings (`faculty`/`Faculty`), so the shared fields are read
  // through `pickField`; otherwise they arrive as blank selects.
  return {
    ...data,
    title: asText(pickField(data, "title")),
    faculty: asText(pickField(data, "faculty")),
    division: asText(pickField(data, "division")),
    subject: asText(pickField(data, "subject")),
    year: asText(pickField(data, "year")),
    semester: SEMESTERS.includes(semester) ? semester : "",
    notes: asText(pickField(data, "notes", "description")),
    UploadContentType: type,
    UploadLink: type === "link" ? link : null,
    UploadText: type === "text" ? text : null,
    UploadFiles: null,
  };
};

const MeetingEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [cool, setCool] = useState(false);

  const handelSnack = (msg, ty) => {
    if (!cool) {
      setCool(true);
      ShowSnackBar(msg, ty);
      setTimeout(() => {
        setCool(false);
      }, 5000);
    }
  };
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!location.state?.meeting);

  const [formData, setFormData] = useState(normalizeContentData(location.state?.meeting || {}));
  const [initialData, setInitialData] = useState(normalizeContentData(location.state?.meeting || {}));

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
        const userId = user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";
        const response = await api.get(`/Student/meet/single/${id}?user_id=${userId}`);
        if (response?.data) {
          const normalized = normalizeContentData(response.data);
          setFormData(normalized);
          setInitialData(normalized);
        } else {
          const empty = normalizeContentData({});
          setFormData(empty);
          setInitialData(empty);
        }
      } catch {
        const empty = normalizeContentData({});
        setFormData(empty);
        setInitialData(empty);
      } finally {
        setFetching(false);
      }
    };

    // The form state is already seeded from location.state on mount, so only
    // fetch when the page was opened directly by URL.
    if (!location.state?.meeting) {
      fetchData();
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
    if (!formData.title?.trim()) {
      handelSnack("Title is required.", "warn");
      return;
    }
    if (String(formData.title ?? "").length > 100) {
      handelSnack("Title must be at most 100 characters.", "warn");
      return;
    }
    const notesVal = formData.notes || formData.description || "";
    if (notesVal && String(notesVal).length > 400) {
      handelSnack("Notes must be at most 400 characters.", "warn");
      return;
    }
    const contentType = formData.UploadContentType || "link";
    if (contentType === "link" && !String(formData.UploadLink || "").trim()) {
      handelSnack("Please provide a link.", "warn");
      return;
    }
    if (contentType === "text" && !String(formData.UploadText || "").trim()) {
      handelSnack("Please provide text content.", "warn");
      return;
    }

    const dateVal = getMeetingDateValue();
    if (dateVal) {
      const selectedDate = new Date(dateVal);
      if (!isNaN(selectedDate.getTime())) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (selectedDate < todayStart) {
          handelSnack("Please select today or a future date and time for the online meeting.", "warn");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const userId =
        user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";
      const submission = buildContentPayload(
        {
          ...formData,
          userid: formData.userid || userId,
          OnlineMeetingDate: dateVal,
        },
        { allowDocuments: false, dateField: "OnlineMeetingDate" },
      );
      await api.put(`/OnlineMeeting/${id}`, submission, { withCredentials: true });
      handelSnack("Meeting updated successfully.", "success");
      navigate(`/meeting/${id}`, { state: { meeting: { ...formData, ...(dateVal ? { OnlineMeetingDate: dateVal } : {}) } } });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ?? err?.response?.data?.error ?? null;
      handelSnack(serverMsg || "Failed to update meeting.", "error");
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
    const raw =
      pickField(
        formData,
        "OnlineMeetingDate",
        "OnlineMeeting_Time",
        "meetingDate",
        "meeting_time",
        "date",
      ) ?? "";
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
      // ISO-like with timezone/offset (e.g. ...Z, +03:00): parse to local components for datetime-local
      if (/(Z|[+-]\d{2}:?\\d{2})$/i.test(trimmed)) {
        return toDateTimeLocal(new Date(trimmed));
      }
      let s = trimmed.replace(" ", "T");
      if (s.includes(".")) s = s.split(".")[0];
      if (s.match(/T\d{2}:\d{2}:\d{2}/)) {
        s = s.replace(/(T\d{2}:\d{2}):\d{2}/, "$1");
      } else if (s.match(/T\d{2}:\d{2}$/)) {
        // already correct
      } else if (s.match(/T\d{2}$/)) {
        s = s + ":00";
      } else if (!s.includes("T") && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        // date-only string; keep as-is won't fit datetime-local, but avoid corruption
        return `${s}T00:00`;
      }
      // Ensure valid datetime-local shape
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

  const setContentType = (type) => {
    setFormData((prev) => ({
      ...prev,
      UploadContentType: type === "text" ? "text" : "link",
      // Preserve content across tab switches so accidental changes don't wipe data.
      UploadLink: prev.UploadLink ?? "",
      UploadText: prev.UploadText ?? "",
      UploadFiles: null,
    }));
  };

  const hasChanges = () => {
    const keys = new Set([...Object.keys(formData || {}), ...Object.keys(initialData || {})]);
    for (let key of keys) {
      const current = formData?.[key];
      const initial = initialData?.[key];
      if (Array.isArray(current) || Array.isArray(initial)) {
        if (!Array.isArray(current) || !Array.isArray(initial) || current.length !== initial.length) return true;
        for (let i = 0; i < current.length; i++) {
          const a = current[i];
          const b = initial[i];
          if (a instanceof File || b instanceof File) {
            if (!(a instanceof File) || !(b instanceof File) || a.name !== b.name || a.size !== b.size || a.lastModified !== b.lastModified) return true;
          } else if (a !== b) return true;
        }
        continue;
      }
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
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Edit Online Meeting
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">Update online meeting details</p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="meeting-title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input readOnly={isGuest} disabled={isGuest}
                  id="meeting-title"
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

              <ContentSection
                data={formData}
                setter={setFormData}
                idPrefix="meeting"
                disabled={isGuest}
                allowedTypes={MEETING_CONTENT_TYPES}
                onSetContentType={(_setter, type) => setContentType(type)}
              />

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
                <input readOnly={isGuest} disabled={isGuest}
                  id="meeting-date"
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
                <label htmlFor="meeting-notes" className={labelClass}>
                  Notes
                </label>
                <textarea readOnly={isGuest} disabled={isGuest}
                  id="meeting-notes"
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

export default MeetingEditPage;
