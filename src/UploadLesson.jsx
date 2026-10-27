import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";

const UploadLesson = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [cool, setCool] = useState(false);
  const [activeTab, setActiveTab] = useState("lessons");

  const handelSnack = (msg, ty) => {
    if (!cool) {
      setCool(true);
      ShowSnackBar(msg, ty);
      setTimeout(() => {
        setCool(false);
      }, 5000);
    }
  };

  const [lessonData, setLessonData] = useState({
    title: "",
    link: "",
    faculty: "",
    division: "",
    subject: "",
    year: "",
    semester: "",
    notes: "",
  });

  const [quizData, setQuizData] = useState({
    title: "",
    faculty: "",
    division: "",
    subject: "",
    year: "",
    semester: "",
    notes: "",
    QuizDate: "",
  });

  const [meetingData, setMeetingData] = useState({
    title: "",
    faculty: "",
    division: "",
    subject: "",
    year: "",
    semester: "",
    notes: "",
    OnlineMeetingDate: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
  }, [user, navigate]);

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setLessonData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuizChange = (e) => {
    const { name, value } = e.target;
    setQuizData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMeetingChange = (e) => {
    const { name, value } = e.target;
    setMeetingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();

    if (!lessonData.title.trim() || !lessonData.link.trim() || !lessonData.subject.trim()) {
      handelSnack("Please fill in all required fields (Title, Link, Subject).", "warn");
      return;
    }

    setLoading(true);

    try {
      // URL left empty as requested
      const response = await api.post("", lessonData, { withCredentials: true });
      handelSnack(response.data?.message ?? "Lesson uploaded successfully.", "success");

      setLessonData({
        title: "",
        link: "",
        faculty: "",
        division: "",
        subject: "",
        year: "",
        semester: "",
        notes: "",
      });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        null;
      const msg = serverMsg ?? "Failed to upload lesson. Please try again.";
      handelSnack(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();

    if (!quizData.title.trim()) {
      handelSnack("Please fill in required field (Title).", "warn");
      return;
    }

    setLoading(true);

    try {
      // URL left empty as requested
      const response = await api.post("", quizData, { withCredentials: true });
      handelSnack(response.data?.message ?? "Quiz uploaded successfully.", "success");

      setQuizData({
        title: "",
        faculty: "",
        division: "",
        subject: "",
        year: "",
        semester: "",
        notes: "",
        QuizDate: "",
      });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        null;
      const msg = serverMsg ?? "Failed to upload quiz. Please try again.";
      handelSnack(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();

    if (!meetingData.title.trim()) {
      handelSnack("Please fill in required field (Title).", "warn");
      return;
    }

    setLoading(true);

    try {
      // URL left empty as requested
      const response = await api.post("", meetingData, { withCredentials: true });
      handelSnack(response.data?.message ?? "Online meeting uploaded successfully.", "success");

      setMeetingData({
        title: "",
        faculty: "",
        division: "",
        subject: "",
        year: "",
        semester: "",
        notes: "",
        OnlineMeetingDate: "",
      });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        null;
      const msg = serverMsg ?? "Failed to upload meeting. Please try again.";
      handelSnack(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role === "student") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
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
            style={activeTab === "lessons" ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
          >
            Lessons
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "quizzes" ? "text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"}`}
            style={activeTab === "quizzes" ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
          >
            Quizzes/Exams
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "meetings" ? "text-white" : "bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"}`}
            style={activeTab === "meetings" ? { backgroundColor: 'var(--color-brand-primary)' } : {}}
          >
            Online Meetings
          </button>
        </div>

        {activeTab === "lessons" && (
          <form onSubmit={handleLessonSubmit} className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
              <div className="space-y-5">
                <div>
                  <label htmlFor="lesson-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-title"
                    name="title"
                    type="text"
                    value={lessonData.title}
                    onChange={handleLessonChange}
                    placeholder="Enter lesson title"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lesson-link" className="block text-sm font-semibold text-gray-700 mb-2">
                    Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lesson-link"
                    name="link"
                    type="url"
                    value={lessonData.link}
                    onChange={handleLessonChange}
                    placeholder="https://example.com/lesson"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="lesson-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lesson-subject"
                      name="subject"
                      type="text"
                      value={lessonData.subject}
                      onChange={handleLessonChange}
                      placeholder="e.g., Mathematics"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lesson-faculty" className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty
                    </label>
                    <input
                      id="lesson-faculty"
                      name="faculty"
                      type="text"
                      value={lessonData.faculty}
                      onChange={handleLessonChange}
                      placeholder="e.g., Engineering"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="lesson-year" className="block text-sm font-semibold text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      id="lesson-year"
                      name="year"
                      type="text"
                      value={lessonData.year}
                      onChange={handleLessonChange}
                      placeholder="e.g., 2nd Year"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="lesson-semester" className="block text-sm font-semibold text-gray-700 mb-2">
                      Semester
                    </label>
                    <input
                      id="lesson-semester"
                      name="semester"
                      type="text"
                      value={lessonData.semester}
                      onChange={handleLessonChange}
                      placeholder="e.g., Fall"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="lesson-division" className="block text-sm font-semibold text-gray-700 mb-2">
                      Division
                    </label>
                    <input
                      id="lesson-division"
                      name="division"
                      type="text"
                      value={lessonData.division}
                      onChange={handleLessonChange}
                      placeholder="e.g., A"
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lesson-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="lesson-notes"
                    name="notes"
                    value={lessonData.notes}
                    onChange={handleLessonChange}
                    placeholder="Additional notes about this lesson..."
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
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
                  <label htmlFor="quiz-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="quiz-title"
                    name="title"
                    type="text"
                    value={quizData.title}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="quiz-faculty" className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty
                    </label>
                    <input
                      id="quiz-faculty"
                      name="faculty"
                      type="text"
                      value={quizData.faculty}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="quiz-division" className="block text-sm font-semibold text-gray-700 mb-2">
                      Division
                    </label>
                    <input
                      id="quiz-division"
                      name="division"
                      type="text"
                      value={quizData.division}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="quiz-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      id="quiz-subject"
                      name="subject"
                      type="text"
                      value={quizData.subject}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="quiz-year" className="block text-sm font-semibold text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      id="quiz-year"
                      name="year"
                      type="text"
                      value={quizData.year}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="quiz-semester" className="block text-sm font-semibold text-gray-700 mb-2">
                      Semester
                    </label>
                    <input
                      id="quiz-semester"
                      name="semester"
                      type="text"
                      value={quizData.semester}
                      onChange={handleQuizChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quiz-date" className="block text-sm font-semibold text-gray-700 mb-2">
                    QuizDate (only date)
                  </label>
                  <input
                    id="quiz-date"
                    name="QuizDate"
                    type="date"
                    value={quizData.QuizDate}
                    onChange={handleQuizChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="quiz-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (not required)
                  </label>
                  <textarea
                    id="quiz-notes"
                    name="notes"
                    value={quizData.notes}
                    onChange={handleQuizChange}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
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
                  <label htmlFor="meeting-title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="meeting-title"
                    name="title"
                    type="text"
                    value={meetingData.title}
                    onChange={handleMeetingChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="meeting-faculty" className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty
                    </label>
                    <input
                      id="meeting-faculty"
                      name="faculty"
                      type="text"
                      value={meetingData.faculty}
                      onChange={handleMeetingChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-division" className="block text-sm font-semibold text-gray-700 mb-2">
                      Division
                    </label>
                    <input
                      id="meeting-division"
                      name="division"
                      type="text"
                      value={meetingData.division}
                      onChange={handleMeetingChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="meeting-subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <input
                      id="meeting-subject"
                      name="subject"
                      type="text"
                      value={meetingData.subject}
                      onChange={handleMeetingChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-year" className="block text-sm font-semibold text-gray-700 mb-2">
                      Year
                    </label>
                    <input
                      id="meeting-year"
                      name="year"
                      type="text"
                      value={meetingData.year}
                      onChange={handleMeetingChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="meeting-semester" className="block text-sm font-semibold text-gray-700 mb-2">
                      Semester
                    </label>
                    <input
                      id="meeting-semester"
                      name="semester"
                      type="text"
                      value={meetingData.semester}
                      onChange={handleMeetingChange}
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="meeting-date" className="block text-sm font-semibold text-gray-700 mb-2">
                    OnlineMeetingDate (date and time)
                  </label>
                  <input
                    id="meeting-date"
                    name="OnlineMeetingDate"
                    type="datetime-local"
                    value={meetingData.OnlineMeetingDate}
                    onChange={handleMeetingChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="meeting-notes" className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (not required)
                  </label>
                  <textarea
                    id="meeting-notes"
                    name="notes"
                    value={meetingData.notes}
                    onChange={handleMeetingChange}
                    rows={4}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
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
