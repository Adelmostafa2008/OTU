import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import ContentSection from "./ContentSection.jsx";
import {
  MEETING_CONTENT_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
  buildContentPayload,
  formatFileSize,
  getFilesTotalSize,
} from "./contentUtils.js";
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

// Builds the plain JSON body the API expects for the selected tab. Every
// accepted property is present; nullable ones are sent as null.
const buildSubmissionData = (data, options = {}) =>
  buildContentPayload(data, options);

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

const Upload = () => {
  const { user, loading: authLoading, isGuest } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");
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

  const [lessonData, setLessonData] = useState(() => ({ ...emptyLesson(), userid: user?.id || "" }));
  const [quizData, setQuizData] = useState(() => ({ ...emptyQuiz(), userid: user?.id || "" }));
  const [meetingData, setMeetingData] = useState(() => ({ ...emptyMeeting(), userid: user?.id || "" }));
  const [assignmentData, setAssignmentData] = useState(() => ({ ...emptyAssignment(), userid: user?.id || "" }));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (String(user.role ?? "").toLowerCase() === "guest") {
      navigate("/", { replace: true });
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
      const submission = buildSubmissionData(
        { ...lessonData, userid: user?.id || lessonData.userid },
        { includeType: true },
      );

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
      const submission = buildSubmissionData(
        { ...quizData, userid: user?.id || quizData.userid },
        { dateField: "QuizDate" },
      );
      
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
        { allowDocuments: false, dateField: "OnlineMeetingDate" },
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
      const submission = buildSubmissionData(
        { ...assignmentData, userid: user?.id || assignmentData.userid },
        { dateField: "deadline" },
      );
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

  if (
    authLoading ||
    !user ||
    user.role === "student" ||
    String(user.role ?? "").toLowerCase() === "guest"
  ) {
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
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Upload
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Add lessons, quizzes/exams, online meetings, or assignments to the platform
        </p>
      </div>

      <div className="w-full">
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
