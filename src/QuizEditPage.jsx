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

const QuizEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!location.state?.quiz);

  const [formData, setFormData] = useState(location.state?.quiz || {});
  const [initialData, setInitialData] = useState(location.state?.quiz || {});

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
        const response = await api.get("/Quizzes", { params: { id } });
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

    if (!location.state?.quiz) {
      fetchData();
    } else {
      setInitialData(location.state?.quiz || {});
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

    const quizDateValue = formData.quizDate || formData.QuizDate || formData.date;
    if (quizDateValue) {
      const selectedDate = new Date(quizDateValue + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        ShowSnackBar("Please select today or a future date for the quiz.", "warn");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = preparePayload(formData);
      const dateVal = getQuizDateValue();
      if (dateVal) {
        payload.QuizDate = dateVal;
        payload.quizDate = dateVal;
        payload.date = dateVal;
      }
      await api.put(`/Quizzes/${id}`, payload, { withCredentials: true });
      ShowSnackBar("Quiz updated successfully.", "success");
      navigate(`/quiz/${id}`, { state: { quiz: payload } });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        null;
      ShowSnackBar(serverMsg || "Failed to update quiz.", "error");
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

  const getQuizDateValue = () => {
    const raw = formData.quizDate || formData.QuizDate || formData.date || formData.quiz_date || formData.startDate || "";
    if (!raw) return "";
    if (typeof raw === "string") {
      if (raw.includes("T")) return raw.split("T")[0];
      if (raw.includes(" ")) return raw.split(" ")[0];
      if (raw.includes(".")) return raw.split(".")[0];
      return raw;
    }
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const quizDateValue = getQuizDateValue();

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
        if (String(current).trim && String(initial).trim) {
          if (String(current).trim() !== String(initial).trim()) return true;
          continue;
        }
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
          Edit Quiz/Exam
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">Update quiz or exam details</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
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
                  <label htmlFor="quiz-faculty" className={labelClass}>
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  {renderFaculties("quiz-faculty", formData.faculty)}
                </div>
                <div>
                  <label htmlFor="quiz-division" className={labelClass}>
                    Division <span className="text-red-500">*</span>
                  </label>
                  {renderDivisions("quiz-division", formData.faculty, formData.division)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="quiz-subject" className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {renderSubjects("quiz-subject", formData.subject)}
                </div>
                <div>
                  <label htmlFor="quiz-year" className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  {renderYears("quiz-year", formData.year)}
                </div>
                <div>
                  <label htmlFor="quiz-semester" className={labelClass}>
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {renderSemesters("quiz-semester", formData.semester)}
                </div>
              </div>

              <div>
                <label htmlFor="quizDate" className={labelClass}>
                  Quiz Date (only date) <span className="text-red-500">*</span>
                </label>
                <input
                  id="quizDate"
                  name="QuizDate"
                  type="date"
                  value={quizDateValue}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className={labelClass}>
                  Notes
                </label>
                <textarea
                  id="notes"
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

export default QuizEditPage;

