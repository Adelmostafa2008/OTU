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
  const { user, isGuest } = useAuth();
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
        const userId =
          user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";
        const response = await api.get(`/Student/quiz/single/${id}?user_id=${userId}`);
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
    if (String(formData.title ?? "").length > 100) {
      ShowSnackBar("Title must be at most 100 characters.", "warn");
      return;
    }
    const notesVal = formData.notes || formData.description || "";
    if (notesVal && String(notesVal).length > 400) {
      ShowSnackBar("Notes must be at most 400 characters.", "warn");
      return;
    }

    const dateVal = getQuizDateValue();
    if (dateVal) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateVal);
      if (match) {
        const selectedDate = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          ShowSnackBar("Please select today or a future date for the quiz.", "warn");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const payload = preparePayload(formData);
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
        err?.response?.data?.message ?? err?.response?.data?.error ?? null;
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
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Edit Quiz/Exam
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">Update quiz or exam details</p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input readOnly={isGuest} disabled={isGuest}
                  id="title"
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
                <input readOnly={isGuest} disabled={isGuest}
                  id="quizDate"
                  name="QuizDate"
                  type="date"
                  value={quizDateValue}
                  onChange={handleChange}
                  className={inputClass}
                  style={fieldStyle}
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className={labelClass}>
                  Notes
                </label>
                <textarea readOnly={isGuest} disabled={isGuest}
                  id="notes"
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

export default QuizEditPage;
