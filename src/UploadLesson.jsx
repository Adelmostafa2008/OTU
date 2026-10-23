import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnackbar } from "./SnackbarContext";

const UploadLesson = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { show, swallowNext } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    link: "",
    faculty: "",
    division: "",
    subject: "",
    year: "",
    semester: "",
    notes: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    // Only instructors can upload lessons
    // if (user.role === "student") {
    //   navigate("/", { replace: true });
    //   return;
    // }
   
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim() || !formData.link.trim() || !formData.subject.trim()) {
      show("Please fill in all required fields (Title, Link, Subject).", "warning");
      swallowNext();
      return;
    }

    setLoading(true);

    try {
      // URL left empty as requested
      const response = await api.post("", formData, { withCredentials: true });
      show(response.data?.message ?? "Lesson uploaded successfully.", "success");
      swallowNext();
      
      // Reset form
      setFormData({
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
      show(msg, "error");
      swallowNext();
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
          Upload Lesson
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Add a new lesson to the platform
        </p>
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
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter lesson title"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div>
                <label htmlFor="link" className="block text-sm font-semibold text-gray-700 mb-2">
                  Link <span className="text-red-500">*</span>
                </label>
                <input
                  id="link"
                  name="link"
                  type="url"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="https://example.com/lesson"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Mathematics"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="faculty" className="block text-sm font-semibold text-gray-700 mb-2">
                    Faculty
                  </label>
                  <input
                    id="faculty"
                    name="faculty"
                    type="text"
                    value={formData.faculty}
                    onChange={handleChange}
                    placeholder="e.g., Engineering"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="year" className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    id="year"
                    name="year"
                    type="text"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="e.g., 2nd Year"
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
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder="e.g., Fall"
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
                    value={formData.division}
                    onChange={handleChange}
                    placeholder="e.g., A"
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
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
                className="w-full sm:w-auto px-8 rounded-xl bg-teal-400 hover:bg-teal-300 text-white font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3"
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
      </div>
    </div>
  );
};

export default UploadLesson;
