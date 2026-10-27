import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";

const QuizEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);

  const dummyQuiz = {
    id: id || "q1",
    title: "Midterm Exam",
    faculty: "Engineering",
    division: "A",
    subject: "Computer Science",
    year: "2nd Year",
    semester: "Fall",
    notes: "Bring calculator",
    quizDate: "2026-11-05",
    QuizDate: "2026-11-05",
    date: "2026-11-05",
  };

  const [formData, setFormData] = useState(location.state?.quiz || dummyQuiz);

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
      try {
        // URL left empty as requested - send id to API
        const response = await api.get("", { params: { id } });
        if (response.data) {
          setFormData(response.data);
        }
      } catch (err) {
        // Use dummy data if fetch fails
      }
    };

    if (!location.state?.quiz) {
      fetchData();
    }
  }, [user, navigate, id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      ShowSnackBar("Title is required.", "warn");
      return;
    }

    setLoading(true);
    try {
      // URL left empty as requested
      await api.put("", { ...formData, id }, { withCredentials: true });
      ShowSnackBar("Quiz updated successfully.", "success");
      navigate(`/quiz/${id}`, { state: { quiz: formData } });
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

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Edit Quiz/Exam
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">Update quiz or exam details</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="faculty" className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculty
                  </label>
                  <input
                    id="faculty"
                    name="faculty"
                    type="text"
                    value={formData.faculty || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="division" className="block text-sm font-semibold text-gray-700 mb-2">
                    Division
                  </label>
                  <input
                    id="division"
                    name="division"
                    type="text"
                    value={formData.division || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="text"
                    value={formData.year || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="semester" className="block text-sm font-semibold text-gray-700 mb-2">
                    Semester
                  </label>
                  <input
                    id="semester"
                    name="semester"
                    type="text"
                    value={formData.semester || ""}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quizDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  QuizDate (date)
                </label>
                <input
                  id="quizDate"
                  name="quizDate"
                  type="date"
                  value={formData.quizDate || formData.QuizDate || formData.date || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (not required)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes || formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 py-3"
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
