import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import axios from "axios";

const s3Client = axios.create();

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
const LESSON_TYPES = ["Lab", "Lecture"];
const CONTENT_TYPES = ["link", "text", "documents"];
// Online meetings never support documents, only a link or text content.
const MEETING_CONTENT_TYPES = ["link", "text"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "50MB";

const baseContentFields = () => ({
  UploadContentType: "link",
  UploadLink: "",
  UploadText: null,
  UploadFiles: null,
});

const emptyLesson = () => ({
  title: "",
  type: "Lecture",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  userid: "",
  ...baseContentFields(),
});

const emptyQuiz = () => ({
  title: "",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  QuizDate: "",
  userid: "",
  ...baseContentFields(),
});

const emptyMeeting = () => ({
  title: "",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  OnlineMeetingDate: "",
  userid: "",
  ...baseContentFields(),
});

const emptyAssignment = () => ({
  title: "",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  deadline: "",
  userid: "",
  ...baseContentFields(),
});

// Empty optional fields are dropped because empty strings can fail
// server-side validation on fields that are supposed to be omitted.
const OPTIONAL_FIELDS = ["notes", "UploadLink", "UploadText"];

const preparePayload = (data) => {
  const payload = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      payload[key] = value;
      return;
    }
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

// Files are never sent to the API. Only a light descriptor is sent (the actual
// bytes go to the cloud storage separately), matching the server `docs` DTO.
const toDocDescriptor = (file) => {
  if (!file) return null;
  const isFile = typeof File !== "undefined" && file instanceof File;
  const filename = isFile ? file.name : file.filename ?? file.name ?? "";
  const size = isFile ? file.size : Number(file.size ?? 0);
  const contentType = isFile ? file.type || "application/octet-stream" : "no type assigned"

  return {
    filename: String(filename),
    size: Number.isFinite(size) ? size : 0,
    content_type: String(contentType),
  };
};

const buildDocs = (files) =>
  (Array.isArray(files) ? files : []).map(toDocDescriptor).filter(Boolean);

const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFilesTotalSize = (files) =>
  (Array.isArray(files) ? files : []).reduce((sum, file) => {
    const size = file instanceof File ? file.size : Number(file?.size ?? 0);
    return sum + (Number.isFinite(size) ? size : 0);
  }, 0);

// After the API creates the records it answers with one presigned URL per file.
// The bytes are then put straight into the cloud storage, exactly like the
// lesson tab does it. Non-file entries (already saved descriptors) are skipped.
const uploadFilesToStorage = async (response, files) => {
  if (!Array.isArray(response?.data)) return;
  const list = Array.isArray(files) ? files : [];

  await Promise.all(
    response.data.map(async (item, index) => {
      const file = list[index];
      if (!file || !(file instanceof File)) return;

      await s3Client.put(item.url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
    }),
  );
};

// Builds the plain JSON body the API expects. Only the properties of the
// selected content tab get a value; the rest are sent as null.
const buildSubmissionData = (data, { allowDocuments = true } = {}) => {
  const { UploadFiles, ...rest } = data;
  const payload = preparePayload(rest);

  const type = !allowDocuments
    ? data.UploadContentType === "text"
      ? "text"
      : "link"
    : data.UploadContentType || "link";

  const docs = allowDocuments && type === "documents" ? buildDocs(UploadFiles) : null;

  payload.UploadLink = type === "link" ? String(data.UploadLink ?? "").trim() : null;
  payload.UploadText = type === "text" ? String(data.UploadText ?? "").trim() : null;

  // UploadContentType names the selected tab: "link", "text" or "documents".
  payload.UploadContentType = type;

  if (allowDocuments) {
    payload.docs = docs;
  } else {
    delete payload.docs;
    delete payload.UploadFiles;
  }

  return payload;
};

const validateContentFields = (data, showSnack, { allowDocuments = true } = {}) => {
  const type = allowDocuments ? data.UploadContentType || "link" : data.UploadContentType === "text" ? "text" : "link";
  if (type === "link") {
    if (!String(data.UploadLink || "").trim()) {
      showSnack("Please provide a link.", "warn");
      return false;
    }
  } else if (type === "text") {
    if (!String(data.UploadText || "").trim()) {
      showSnack("Please provide text content.", "warn");
      return false;
    }
  } else if (type === "documents") {
    const files = Array.isArray(data.UploadFiles) ? data.UploadFiles : [];
    if (files.length === 0) {
      showSnack("Please select at least one document.", "warn");
      return false;
    }
    if (getFilesTotalSize(files) > MAX_FILE_SIZE) {
      showSnack(`Total file size cannot exceed ${MAX_FILE_SIZE_LABEL} per upload.`, "warn");
      return false;
    }
  }
  return true;
};

const FIELD_LABELS = {
  title: "Title",
  type: "Type",
  subject: "Subject",
  faculty: "Faculty",
  division: "Division",
  year: "Year",
  semester: "Semester",
  notes: "Notes",
  QuizDate: "Quiz Date",
  OnlineMeetingDate: "Online Meeting Date",
  deadline: "Deadline",
  UploadLink: "Link",
  UploadText: "Text",
  UploadFiles: "Documents",
};

const LESSON_REQUIRED = ["title", "type", "subject", "faculty", "division", "year", "semester"];
const QUIZ_REQUIRED = ["title", "faculty", "division", "subject", "year", "semester", "QuizDate"];
const MEETING_REQUIRED = [
  "title",
  "faculty",
  "division",
  "subject",
  "year",
  "semester",
  "OnlineMeetingDate",
];
const ASSIGNMENT_REQUIRED = [
  "title",
  "faculty",
  "division",
  "subject",
  "year",
  "semester",
  "deadline",
];

// Returns the labels of the required fields that are still empty.
const findMissingFields = (data, requiredFields) =>
  requiredFields
    .filter((field) => !String(data[field] ?? "").trim())
    .map((field) => FIELD_LABELS[field] ?? field);

// Pull a readable message out of any error shape axios can produce
const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data.trim();

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

const validateTextLimits = (data, ShowSnackBarFn) => {
  if (data.title !== undefined && data.title !== null) {
    const titleStr = String(data.title);
    if (titleStr.length > 100) {
      ShowSnackBarFn("Title must be at most 100 characters.", "warn");
      return false;
    }
  }
  if (data.notes !== undefined && data.notes !== null && data.notes !== "") {
    const notesStr = String(data.notes);
    if (notesStr.length > 400) {
      ShowSnackBarFn("Notes must be at most 400 characters.", "warn");
      return false;
    }
  }
  return true;
};

const inputClass =
  "w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";
const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
const fieldStyle = { borderColor: "var(--color-border-primary)" };

const ContentSection = ({ data, setter, idPrefix, disabled = false, allowedTypes = CONTENT_TYPES, onSetContentType, onFileSelection, onRemoveFile, onAddMoreFiles }) => {
    const type = data.UploadContentType || "link";
    const tabBase =
      "px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors";
    const activeStyle = { backgroundColor: "var(--color-brand-primary)", color: "#ffffff", borderColor: "var(--color-brand-primary)" };
    const inactiveStyle = { borderColor: "var(--color-border-primary)", color: "var(--color-text-primary, #111827)", backgroundColor: "#ffffff" };
    const files = Array.isArray(data.UploadFiles) ? data.UploadFiles : [];
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {allowedTypes.map((option) => {
            const active = type === option;
            const label = option === "link" ? "Link" : option === "text" ? "Text" : "Documents";
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSetContentType(setter, option)}
                className={`${tabBase} cursor-pointer`}
                style={active ? activeStyle : inactiveStyle}
              >
                {label}
              </button>
            );
          })}
        </div>

        {type === "link" && (
          <div>
            <label htmlFor={`${idPrefix}-upload-link`} className={labelClass}>
              Link <span className="text-red-500">*</span>
            </label>
            <input
              id={`${idPrefix}-upload-link`}
              name="UploadLink"
              type="url"
              disabled={disabled}
              value={data.UploadLink || ""}
              onChange={(e) => setter((prev) => ({ ...prev, UploadLink: e.target.value }))}
              placeholder="https://example.com/resource"
              className={inputClass}
              style={fieldStyle}
              required={!disabled}
            />
          </div>
        )}

        {type === "text" && (
          <div>
            <label htmlFor={`${idPrefix}-upload-text`} className={labelClass}>
              Text <span className="text-red-500">*</span>
            </label>
            <textarea
              id={`${idPrefix}-upload-text`}
              name="UploadText"
              disabled={disabled}
              value={data.UploadText || ""}
              onChange={(e) => setter((prev) => ({ ...prev, UploadText: e.target.value }))}
              placeholder="Enter text content..."
              rows={6}
              className={`${inputClass} resize-none overflow-y-auto`}
              style={{ ...fieldStyle, minHeight: "160px" }}
              required={!disabled}
            />
          </div>
        )}

        {type === "documents" && (
          <div>
            <label className={labelClass}>
              Documents <span className="text-red-500">*</span>
            </label>
            <div
              className="w-full rounded-2xl border-2 border-dashed p-5 sm:p-6 flex flex-col items-stretch text-center bg-gray-50/60"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              <div className="flex flex-col items-center justify-center">
                <input
                  id={`${idPrefix}-upload-files`}
                  type="file"
                  multiple
                  className="hidden"
                  disabled={disabled}
                  onChange={(e) => onFileSelection(setter, e)}
                />
                <input
                  id={`${idPrefix}-upload-files-add`}
                  type="file"
                  multiple
                  className="hidden"
                  disabled={disabled}
                  onChange={(e) => onFileSelection(setter, e, { append: true })}
                />
                {files.length === 0 && (
                  <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{ backgroundColor: "rgba(0,0,0,0.04)", color: "var(--color-brand-primary)" }}
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4" />
                      <path d="M7 9l5-5 5 5" />
                      <path d="M4 20h16" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      if (disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      document.getElementById(`${idPrefix}-upload-files`)?.click();
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                    style={{ backgroundColor: "var(--color-brand-primary)" }}
                  >
                    Browse
                  </button>
                  <p className="m-0 mt-2 text-xs text-gray-500">Maximum total size {MAX_FILE_SIZE_LABEL}</p>
                  </>
                )}
              </div>

              {files.length > 0 && (() => {
                const totalSize = getFilesTotalSize(files);
                const atLimit = totalSize >= MAX_FILE_SIZE;
                return (
                  <div className="w-full text-left rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "var(--color-border-primary)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {files.length} file{files.length > 1 ? "s" : ""} selected
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600">
                        Total: <span className={totalSize > MAX_FILE_SIZE ? "text-red-600 font-semibold" : "text-gray-900 font-semibold"}>{formatFileSize(totalSize)}</span>
                        <span className="text-gray-400"> / {MAX_FILE_SIZE_LABEL}</span>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map((file, idx) => {
                          const name = file.name || file.filename || "file";
                          const size = file instanceof File ? file.size : Number(file.size ?? 0);
                          return (
                            <div
                              key={`${name}-${idx}-${size}`}
                              className="group flex items-start gap-3 rounded-xl border bg-gray-50/70 p-3 sm:p-3.5 min-w-0"
                              style={{ borderColor: "var(--color-border-primary)" }}
                              title={name}
                            >
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white border text-gray-600 shadow-sm" style={{ borderColor: "var(--color-border-primary)" }} aria-hidden="true">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <path d="M14 2v6h6" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="m-0 text-sm font-semibold text-gray-900 leading-snug break-words line-clamp-3">
                                  {name}
                                </p>
                                <p className="m-0 mt-1 text-xs text-gray-500">
                                  {formatFileSize(size)}
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onRemoveFile(setter, idx)}
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border bg-white text-gray-500 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer"}`}
                                style={{ borderColor: "var(--color-border-primary)" }}
                                aria-label={`Remove ${name}`}
                                title="Remove file"
                              >
                                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => onAddMoreFiles(idPrefix, files, disabled)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${atLimit ? "opacity-50" : "hover:bg-gray-50"}`}
                        style={{ borderColor: "var(--color-border-primary)", color: "var(--color-text-primary, #111827)", backgroundColor: "#ffffff" }}
                        aria-label="Add more files"
                      >
                        <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add more
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

const Upload = () => {
  const { user, loading: authLoading, isGuest } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");
  const lastSnackRef = useRef({ message: "", at: 0 });

  const handelSnack = (msg, ty) => {
    const now = Date.now();
    const last = lastSnackRef.current;
    if (last.message === msg && now - last.at < 1000) return;
    lastSnackRef.current = { message: msg, at: now };
    ShowSnackBar(msg, ty);
  };

  const [lessonData, setLessonData] = useState(() => ({ ...emptyLesson(), userid: user?.id || "" }));
  const [quizData, setQuizData] = useState(() => ({ ...emptyQuiz(), userid: user?.id || "" }));
  const [meetingData, setMeetingData] = useState(() => ({ ...emptyMeeting(), userid: user?.id || "" }));
  const [assignmentData, setAssignmentData] = useState(() => ({ ...emptyAssignment(), userid: user?.id || "" }));

  useEffect(() => {
    if (user?.id) {
      setLessonData((prev) => ({ ...prev, userid: user.id }));
      setQuizData((prev) => ({ ...prev, userid: user.id }));
      setMeetingData((prev) => ({ ...prev, userid: user.id }));
      setAssignmentData((prev) => ({ ...prev, userid: user.id }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate, authLoading]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "title" && typeof value === "string") {
      nextValue = value.slice(0, 100);
    } else if (name === "notes" && typeof value === "string") {
      nextValue = value.slice(0, 400);
    }
    setter((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === "faculty") {
        next.division = "";
      }
      return next;
    });
  };

  const handleLessonChange = handleChange(setLessonData);
  const handleQuizChange = handleChange(setQuizData);
  const handleMeetingChange = handleChange(setMeetingData);
  const handleAssignmentChange = handleChange(setAssignmentData);


  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const missing = findMissingFields(lessonData, LESSON_REQUIRED);
    if (missing.length > 0) {
      handelSnack(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }
    if (!validateTextLimits(lessonData, handelSnack)) {
      return;
    }
    if (!validateContentFields(lessonData, handelSnack)) {
      return;
    }

    setLoading(true);

    try {
      const submission = buildSubmissionData({ ...lessonData, userid: user?.id || lessonData.userid });

      const response = await api.post("/Upload", submission, {
        withCredentials: true,
      });
      await uploadFilesToStorage(response, lessonData.UploadFiles);
      handelSnack(response?.data?.message ?? "Lesson uploaded successfully.", "success");
      setLessonData({ ...emptyLesson(), userid: user?.id || "" });
    } catch (err) {
      handelSnack(
        getErrorMessage(err, "Failed to upload lesson. Please try again."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const missing = findMissingFields(quizData, QUIZ_REQUIRED);
    if (missing.length > 0) {
      handelSnack(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }
    if (!validateTextLimits(quizData, handelSnack)) {
      return;
    }
    if (!validateContentFields(quizData, handelSnack)) {
      return;
    }

    if (quizData.QuizDate) {
      const selectedDate = new Date(quizData.QuizDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        handelSnack("Please select today or a future date for the quiz.", "warn");
        return;
      }
    }

    setLoading(true);

    try {
      const submission = buildSubmissionData({ ...quizData, userid: user?.id || quizData.userid });
      
      const response = await api.post("/Quizzes", submission, {
        withCredentials: true,
      });
      await uploadFilesToStorage(response, quizData.UploadFiles);
      handelSnack(response?.data?.message ?? "Quiz uploaded successfully.", "success");
      setQuizData({ ...emptyQuiz(), userid: user?.id || "" });
    } catch (err) {
      handelSnack(
        getErrorMessage(err, "Failed to upload quiz. Please try again."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const missing = findMissingFields(meetingData, MEETING_REQUIRED);
    if (missing.length > 0) {
      handelSnack(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }
    if (!validateTextLimits(meetingData, handelSnack)) {
      return;
    }
    if (!validateContentFields(meetingData, handelSnack, { allowDocuments: false })) {
      return;
    }

    if (meetingData.OnlineMeetingDate) {
      const selectedDate = new Date(meetingData.OnlineMeetingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);
      if (selectedDateOnly < today) {
        handelSnack("Please select today or a future date and time for the online meeting.", "warn");
        return;
      }
    }

    setLoading(true);

    try {
      const submission = buildSubmissionData(
        { ...meetingData, userid: user?.id || meetingData.userid },
        { allowDocuments: false },
      );
      const response = await api.post("/OnlineMeeting", submission, {
        withCredentials: true,
      });
      handelSnack(response?.data?.message ?? "Online meeting uploaded successfully.", "success");
      setMeetingData({ ...emptyMeeting(), userid: user?.id || "" });
    } catch (err) {
      handelSnack(
        getErrorMessage(err, "Failed to upload meeting. Please try again."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const missing = findMissingFields(assignmentData, ASSIGNMENT_REQUIRED);
    if (missing.length > 0) {
      handelSnack(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }
    if (!validateTextLimits(assignmentData, handelSnack)) {
      return;
    }
    if (!validateContentFields(assignmentData, handelSnack)) {
      return;
    }

    if (assignmentData.deadline) {
      const selectedDate = new Date(assignmentData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);
      if (selectedDateOnly < today) {
        handelSnack("Please select today or a future date and time for the assignment deadline.", "warn");
        return;
      }
    }

    const userId = user?.id || user?._id || user?.userId;
    if (!userId) {
      handelSnack("User ID not found. Please re-login and try again.", "error");
      return;
    }

    setLoading(true);

    try {
      const submission = buildSubmissionData({ ...assignmentData, userid: user?.id || assignmentData.userid });
      const response = await api.post(`/assignment/${userId}`, submission, {
        withCredentials: true,
      });
      await uploadFilesToStorage(response, assignmentData.UploadFiles);
      handelSnack(response?.data?.message ?? "Assignment uploaded successfully.", "success");
      setAssignmentData({ ...emptyAssignment(), userid: user?.id || "" });
    } catch (err) {
      handelSnack(
        getErrorMessage(err, "Failed to upload assignment. Please try again."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role === "student") {
    return null;
  }

  const renderSubjects = (id, value, onChange) => (
    <select id={id} name="subject" value={value} onChange={onChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select subject</option>
      {SUBJECTS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderFaculties = (id, value, onChange) => (
    <select id={id} name="faculty" value={value} onChange={onChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select faculty</option>
      {FACULTIES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderDivisions = (id, faculty, value, onChange) => {
    const options = DIVISIONS_BY_FACULTY[faculty] || [];
    return (
      <select
        id={id}
        name="division"
        value={value}
        onChange={onChange}
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

  const renderYears = (id, value, onChange) => (
    <select id={id} name="year" value={value} onChange={onChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderSemesters = (id, value, onChange) => (
    <select id={id} name="semester" value={value} onChange={onChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select semester</option>
      {SEMESTERS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const tabButton = (key, label) => {
    const active = activeTab === key;
    return (
      <button
        type="button"
        onClick={() => setActiveTab(key)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
          active ? "text-white" : "bg-white border text-gray-900 hover:bg-gray-50"
        }`}
        style={
          active
            ? { backgroundColor: "var(--color-brand-primary)", color: "#ffffff" }
            : { borderColor: "var(--color-border-primary)" }
        }
      >
        {label}
      </button>
    );
  };

  // file inputs are triggered by id from click handlers (avoids ref access during render)

  const setContentType = (setter, type) => {
    setter((prev) => ({
      ...prev,
      UploadContentType: type,
      UploadLink: type === "link" ? (prev.UploadLink ?? "") : null,
      UploadText: type === "text" ? (prev.UploadText ?? "") : null,
      UploadFiles: type === "documents" ? (prev.UploadFiles ?? null) : null,
    }));
  };

  const handleFileSelection = (setter, e, { append = false } = {}) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (selected.length === 0) return;

    setter((prev) => {
      const currentFiles = Array.isArray(prev.UploadFiles) ? prev.UploadFiles : [];
      const baseFiles = append ? currentFiles : [];
      const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
      if (oversized) {
        handelSnack(
          `"${oversized.name}" is ${formatFileSize(oversized.size)}, which is over the ${MAX_FILE_SIZE_LABEL} limit. Please choose a smaller file.`,
          "warn",
        );
        return prev;
      }
      const nextFiles = [...baseFiles, ...selected];
      const totalSize = getFilesTotalSize(nextFiles);
      if (totalSize > MAX_FILE_SIZE) {
        handelSnack(
          `Total file size cannot exceed ${MAX_FILE_SIZE_LABEL} per upload.`,
          "warn",
        );
        return prev;
      }
      return { ...prev, UploadFiles: nextFiles, UploadContentType: "documents" };
    });
  };

  const handleRemoveFile = (setter, index) => {
    setter((prev) => {
      const currentFiles = Array.isArray(prev.UploadFiles) ? prev.UploadFiles : [];
      const nextFiles = currentFiles.filter((_, i) => i !== index);
      return { ...prev, UploadFiles: nextFiles.length > 0 ? nextFiles : null };
    });
  };

  const handleAddMoreFiles = (idPrefix, files, disabled) => {
    if (disabled) return;
    if (getFilesTotalSize(files) >= MAX_FILE_SIZE) {
      handelSnack("Size cannot exceed the maximum size of upload per time.", "warn");
      return;
    }
    document.getElementById(`${idPrefix}-upload-files-add`)?.click();
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Upload
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Add lessons, quizzes/exams, online meetings, or assignments to the platform
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
          {tabButton("lessons", "Lessons")}
          {tabButton("quizzes", "Quizzes/Exams")}
          {tabButton("meetings", "Online Meetings")}
          {tabButton("assignments", "Assignments")}
        </div>

        {activeTab === "lessons" && (
          <form onSubmit={handleLessonSubmit} className="space-y-6">
            <div
              className="bg-white border rounded-2xl p-6 sm:p-8"
              style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="lesson-title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-title"
                    name="title"
                    type="text"
                    maxLength={100}
                    value={lessonData.title}
                    onChange={handleLessonChange}
                    placeholder="Enter lesson title"
                    className={inputClass}
                    style={fieldStyle}
                    required
                  />
                </div>

                <ContentSection data={lessonData} setter={setLessonData} idPrefix="lesson" disabled={isGuest} onSetContentType={setContentType} onFileSelection={handleFileSelection} onRemoveFile={handleRemoveFile} onAddMoreFiles={handleAddMoreFiles} />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="lesson-type" className={labelClass}>
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="lesson-type"
                      name="type"
                      value={lessonData.type}
                      onChange={handleLessonChange}
                      className={selectClass}
                      style={fieldStyle}
                      required
                    >
                      {LESSON_TYPES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lesson-subject" className={labelClass}>
                      Subject <span className="text-red-500">*</span>
                    </label>
                    {renderSubjects("lesson-subject", lessonData.subject, handleLessonChange)}
                  </div>

                  <div>
                    <label htmlFor="lesson-faculty" className={labelClass}>
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    {renderFaculties("lesson-faculty", lessonData.faculty, handleLessonChange)}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="lesson-year" className={labelClass}>
                      Year <span className="text-red-500">*</span>
                    </label>
                    {renderYears("lesson-year", lessonData.year, handleLessonChange)}
                  </div>

                  <div>
                    <label htmlFor="lesson-semester" className={labelClass}>
                      Semester <span className="text-red-500">*</span>
                    </label>
                    {renderSemesters("lesson-semester", lessonData.semester, handleLessonChange)}
                  </div>

                  <div>
                    <label htmlFor="lesson-division" className={labelClass}>
                      Division <span className="text-red-500">*</span>
                    </label>
                    {renderDivisions(
                      "lesson-division",
                      lessonData.faculty,
                      lessonData.division,
                      handleLessonChange,
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="lesson-notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea
                    id="lesson-notes"
                    name="notes"
                    maxLength={400}
                    value={lessonData.notes}
                    onChange={handleLessonChange}
                    placeholder="Additional notes about this lesson..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || isGuest}
                  className={`w-full sm:w-auto text-white px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] py-3 ${isGuest ? "opacity-60" : "disabled:opacity-85"}`}
                  style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload Lesson"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "quizzes" && (
          <form onSubmit={handleQuizSubmit} className="space-y-6">
            <div
              className="bg-white border rounded-2xl p-6 sm:p-8"
              style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="quiz-title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quiz-title"
                    name="title"
                    type="text"
                    maxLength={100}
                    value={quizData.title}
                    onChange={handleQuizChange}
                    className={inputClass}
                    style={fieldStyle}
                    required
                  />
                </div>

                <ContentSection data={quizData} setter={setQuizData} idPrefix="quiz" disabled={isGuest} onSetContentType={setContentType} onFileSelection={handleFileSelection} onRemoveFile={handleRemoveFile} onAddMoreFiles={handleAddMoreFiles} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="quiz-faculty" className={labelClass}>
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    {renderFaculties("quiz-faculty", quizData.faculty, handleQuizChange)}
                  </div>
                  <div>
                    <label htmlFor="quiz-division" className={labelClass}>
                      Division <span className="text-red-500">*</span>
                    </label>
                    {renderDivisions(
                      "quiz-division",
                      quizData.faculty,
                      quizData.division,
                      handleQuizChange,
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="quiz-subject" className={labelClass}>
                      Subject <span className="text-red-500">*</span>
                    </label>
                    {renderSubjects("quiz-subject", quizData.subject, handleQuizChange)}
                  </div>
                  <div>
                    <label htmlFor="quiz-year" className={labelClass}>
                      Year <span className="text-red-500">*</span>
                    </label>
                    {renderYears("quiz-year", quizData.year, handleQuizChange)}
                  </div>
                  <div>
                    <label htmlFor="quiz-semester" className={labelClass}>
                      Semester <span className="text-red-500">*</span>
                    </label>
                    {renderSemesters("quiz-semester", quizData.semester, handleQuizChange)}
                  </div>
                </div>

                <div>
                  <label htmlFor="quiz-date" className={labelClass}>
                    Quiz Date (only date) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quiz-date"
                    name="QuizDate"
                    type="date"
                    value={quizData.QuizDate}
                    onChange={handleQuizChange}
                    className={inputClass}
                    style={fieldStyle}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quiz-notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea
                    id="quiz-notes"
                    name="notes"
                    maxLength={400}
                    value={quizData.notes}
                    onChange={handleQuizChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || isGuest}
                  className={`w-full sm:w-auto text-white px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] py-3 ${isGuest ? "opacity-60" : "disabled:opacity-85"}`}
                  style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload Quiz/Exam"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "meetings" && (
          <form onSubmit={handleMeetingSubmit} className="space-y-6">
            <div
              className="bg-white border rounded-2xl p-6 sm:p-8"
              style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="meeting-title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="meeting-title"
                    name="title"
                    type="text"
                    maxLength={100}
                    value={meetingData.title}
                    onChange={handleMeetingChange}
                    className={inputClass}
                    style={fieldStyle}
                    required
                  />
                </div>

                <ContentSection data={meetingData} setter={setMeetingData} idPrefix="meeting" disabled={isGuest} allowedTypes={MEETING_CONTENT_TYPES} onSetContentType={setContentType} onFileSelection={handleFileSelection} onRemoveFile={handleRemoveFile} onAddMoreFiles={handleAddMoreFiles} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="meeting-faculty" className={labelClass}>
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    {renderFaculties("meeting-faculty", meetingData.faculty, handleMeetingChange)}
                  </div>
                  <div>
                    <label htmlFor="meeting-division" className={labelClass}>
                      Division <span className="text-red-500">*</span>
                    </label>
                    {renderDivisions(
                      "meeting-division",
                      meetingData.faculty,
                      meetingData.division,
                      handleMeetingChange,
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="meeting-subject" className={labelClass}>
                      Subject <span className="text-red-500">*</span>
                    </label>
                    {renderSubjects("meeting-subject", meetingData.subject, handleMeetingChange)}
                  </div>
                  <div>
                    <label htmlFor="meeting-year" className={labelClass}>
                      Year <span className="text-red-500">*</span>
                    </label>
                    {renderYears("meeting-year", meetingData.year, handleMeetingChange)}
                  </div>
                  <div>
                    <label htmlFor="meeting-semester" className={labelClass}>
                      Semester <span className="text-red-500">*</span>
                    </label>
                    {renderSemesters("meeting-semester", meetingData.semester, handleMeetingChange)}
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
                    value={meetingData.OnlineMeetingDate}
                    onChange={handleMeetingChange}
                    className={inputClass}
                    style={fieldStyle}
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
                    maxLength={400}
                    value={meetingData.notes}
                    onChange={handleMeetingChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || isGuest}
                  className="w-full sm:w-auto px-8 rounded-xl text-white font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3"
                  style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload Online Meeting"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {activeTab === "assignments" && (
          <form onSubmit={handleAssignmentSubmit} className="space-y-6">
            <div
              className="bg-white border rounded-2xl p-6 sm:p-8"
              style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="space-y-5">
                <div>
                  <label htmlFor="assignment-title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="assignment-title"
                    name="title"
                    type="text"
                    maxLength={100}
                    value={assignmentData.title}
                    onChange={handleAssignmentChange}
                    className={inputClass}
                    style={fieldStyle}
                    required
                  />
                </div>

                <ContentSection data={assignmentData} setter={setAssignmentData} idPrefix="assignment" disabled={isGuest} onSetContentType={setContentType} onFileSelection={handleFileSelection} onRemoveFile={handleRemoveFile} onAddMoreFiles={handleAddMoreFiles} />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="assignment-faculty" className={labelClass}>
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    {renderFaculties("assignment-faculty", assignmentData.faculty, handleAssignmentChange)}
                  </div>
                  <div>
                    <label htmlFor="assignment-division" className={labelClass}>
                      Division <span className="text-red-500">*</span>
                    </label>
                    {renderDivisions(
                      "assignment-division",
                      assignmentData.faculty,
                      assignmentData.division,
                      handleAssignmentChange,
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="assignment-subject" className={labelClass}>
                      Subject <span className="text-red-500">*</span>
                    </label>
                    {renderSubjects("assignment-subject", assignmentData.subject, handleAssignmentChange)}
                  </div>
                  <div>
                    <label htmlFor="assignment-year" className={labelClass}>
                      Year <span className="text-red-500">*</span>
                    </label>
                    {renderYears("assignment-year", assignmentData.year, handleAssignmentChange)}
                  </div>
                  <div>
                    <label htmlFor="assignment-semester" className={labelClass}>
                      Semester <span className="text-red-500">*</span>
                    </label>
                    {renderSemesters("assignment-semester", assignmentData.semester, handleAssignmentChange)}
                  </div>
                </div>

                <div>
                  <label htmlFor="assignment-date" className={labelClass}>
                    Deadline (date and time) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="assignment-date"
                    name="deadline"
                    type="datetime-local"
                    value={assignmentData.deadline}
                    onChange={handleAssignmentChange}
                    className={inputClass}
                    style={fieldStyle}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="assignment-notes" className={labelClass}>
                    Notes
                  </label>
                  <textarea
                    id="assignment-notes"
                    name="notes"
                    maxLength={400}
                    value={assignmentData.notes}
                    onChange={handleAssignmentChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading || isGuest}
                  className="w-full sm:w-auto px-8 rounded-xl text-white font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3"
                  style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload Assignment"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Upload;
