import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";

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

const emptyLesson = {
  title: "",
  link: "",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
};

const emptyQuiz = {
  title: "",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  QuizDate: "",
};

const emptyMeeting = {
  title: "",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  OnlineMeetingDate: "",
};

// Empty optional fields are dropped because empty strings can fail
// server-side validation on fields that are supposed to be omitted.
const OPTIONAL_FIELDS = ["notes"];

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

const FIELD_LABELS = {
  title: "Title",
  link: "Link",
  subject: "Subject",
  faculty: "Faculty",
  division: "Division",
  year: "Year",
  semester: "Semester",
  notes: "Notes",
  QuizDate: "Quiz Date",
  OnlineMeetingDate: "Online Meeting Date",
};

const LESSON_REQUIRED = ["title", "link", "subject", "faculty", "division", "year", "semester"];
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

// Returns the labels of the required fields that are still empty.
const findMissingFields = (data, requiredFields) =>
  requiredFields
    .filter((field) => !String(data[field] ?? "").trim())
    .map((field) => FIELD_LABELS[field] ?? field);

// Pull a readable message out of any error shape axios can produce
// (string body, { message }, { error }, { msg }, { title }, { errors: {...} },
// or no response at all when the network is down).
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

const UploadLesson = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");
  const lastSnackRef = useRef({ message: "", at: 0 });

  // Only the newest snackbar is visible, so suppress the exact same message
  // fired twice in a row, but never swallow a different (e.g. success) one.
  const handelSnack = (msg, ty) => {
    const now = Date.now();
    const last = lastSnackRef.current;
    if (last.message === msg && now - last.at < 1000) return;
    lastSnackRef.current = { message: msg, at: now };
    ShowSnackBar(msg, ty);
  };

  const [lessonData, setLessonData] = useState(emptyLesson);
  const [quizData, setQuizData] = useState(emptyQuiz);
  const [meetingData, setMeetingData] = useState(emptyMeeting);

  useEffect(() => {
    // Wait for the stored user to be restored, otherwise a refresh
    // bounces the user to the login page.
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate, authLoading]);

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => {
      const next = { ...prev, [name]: value };
      // Division options depend on the selected faculty, so reset it.
      if (name === "faculty") {
        next.division = "";
      }
      return next;
    });
  };

  const handleLessonChange = handleChange(setLessonData);
  const handleQuizChange = handleChange(setQuizData);
  const handleMeetingChange = handleChange(setMeetingData);

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const missing = findMissingFields(lessonData, LESSON_REQUIRED);
    if (missing.length > 0) {
      handelSnack(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/Upload", preparePayload(lessonData), {
        withCredentials: true,
      });
      handelSnack(response?.data?.message ?? "Lesson uploaded successfully.", "success");
      setLessonData(emptyLesson);
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
      const response = await api.post("/Quizzes", preparePayload(quizData), {
        withCredentials: true,
      });
      handelSnack(response?.data?.message ?? "Quiz uploaded successfully.", "success");
      setQuizData(emptyQuiz);
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
      const response = await api.post("/OnlineMeeting", preparePayload(meetingData), {
        withCredentials: true,
      });
      handelSnack(response?.data?.message ?? "Online meeting uploaded successfully.", "success");
      setMeetingData(emptyMeeting);
    } catch (err) {
      handelSnack(
        getErrorMessage(err, "Failed to upload meeting. Please try again."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role === "student") {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20";
  const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  const renderSubjects = (id, value, onChange) => (
    <select id={id} name="subject" value={value} onChange={onChange} className={selectClass} required>
      <option value="">Select subject</option>
      {SUBJECTS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderFaculties = (id, value, onChange) => (
    <select id={id} name="faculty" value={value} onChange={onChange} className={selectClass} required>
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
    <select id={id} name="year" value={value} onChange={onChange} className={selectClass} required>
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderSemesters = (id, value, onChange) => (
    <select id={id} name="semester" value={value} onChange={onChange} className={selectClass} required>
      <option value="">Select semester</option>
      {SEMESTERS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight max-w-[50%] truncate">
          Upload
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Add lessons, quizzes/exams, or online meetings to the platform
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("lessons")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "lessons" ? "text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"}`}
            style={activeTab === "lessons" ? { backgroundColor: 'var(--color-brand-primary)', color: '#ffffff' } : {}}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "quizzes" ? "text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"}`}
            style={activeTab === "quizzes" ? { backgroundColor: 'var(--color-brand-primary)', color: '#ffffff' } : {}}
          >
            Quizzes/Exams
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "meetings" ? "text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"}`}
            style={activeTab === "meetings" ? { backgroundColor: 'var(--color-brand-primary)', color: '#ffffff' } : {}}
          >
            Online Meetings
          </button>
        </div>

        {activeTab === "lessons" && (
          <form onSubmit={handleLessonSubmit} className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
              <div className="space-y-5">
                <div>
                  <label htmlFor="lesson-title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-title"
                    name="title"
                    type="text"
                    value={lessonData.title}
                    onChange={handleLessonChange}
                    placeholder="Enter lesson title"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lesson-link" className={labelClass}>
                    Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-link"
                    name="link"
                    type="url"
                    value={lessonData.link}
                    onChange={handleLessonChange}
                    placeholder="https://example.com/lesson"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                    value={lessonData.notes}
                    onChange={handleLessonChange}
                    placeholder="Additional notes about this lesson..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto text-white px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
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
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
              <div className="space-y-5">
                <div>
                  <label htmlFor="quiz-title" className={labelClass}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quiz-title"
                    name="title"
                    type="text"
                    value={quizData.title}
                    onChange={handleQuizChange}
                    className={inputClass}
                    required
                  />
                </div>

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
                    value={quizData.notes}
                    onChange={handleQuizChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto text-white px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
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
                    value={meetingData.title}
                    onChange={handleMeetingChange}
                    className={inputClass}
                    required
                  />
                </div>

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
                    value={meetingData.notes}
                    onChange={handleMeetingChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 rounded-xl text-white font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
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
      </div>
    </div>
  );
};

export default UploadLesson;
