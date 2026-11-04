import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
const GROUPS = ["A", "B"];

const emptyStudent = {
  name: "",
  email: "",
  password: "",
  code: "",
  Faculty: "",
  Division: "",
  Group: "",
  Year: "",
};



const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  password: "Password",
  code: "University Code",
  Faculty: "Faculty",
  Division: "Division",
  Group: "Group",
  Year: "Year",
};

const REQUIRED_FIELDS = ["name", "email", "password", "code", "Faculty", "Division", "Group", "Year"];

const findMissingFields = (data, requiredFields) =>
  requiredFields
    .filter((field) => !String(data[field] ?? "").trim())
    .map((field) => FIELD_LABELS[field] ?? field);

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof err?.plainMessage === "string" && err.plainMessage.trim()) return err.plainMessage.trim();
  if (typeof err?.message === "string" && err.message.trim() && err.message !== "Request failed with status code")
    return err.message.trim();

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

const validateNewPassword = (password) => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one capital letter.";
  }
  return null;
};

const AddStudent = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(emptyStudent);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate, authLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "Faculty") {
        next.Division = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const missing = findMissingFields(studentData, REQUIRED_FIELDS);
    if (missing.length > 0) {
      ShowSnackBar(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }

    const passwordError = validateNewPassword(studentData.password);
    if (passwordError) {
      ShowSnackBar(passwordError, "warn");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/Reg/create", studentData, {
        withCredentials: true,
      });
      const successMsg =
        response?.plainMessage ||
        response?.message ||
        (typeof response?.data === "string" ? response.data : response?.data?.message) ||
        "Student added successfully.";
      ShowSnackBar(successMsg, "success");
      setStudentData(emptyStudent);
    } catch (err) {
      ShowSnackBar(getErrorMessage(err, "Failed to add student. Please try again."), "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || user.role !== "admin") {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20";
  const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

  const renderFaculties = () => (
    <select
      id="faculty"
      name="Faculty"
      value={studentData.Faculty}
      onChange={handleChange}
      className={selectClass}
      required
    >
      <option value="">Select faculty</option>
      {FACULTIES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderDivisions = () => {
    const options = DIVISIONS_BY_FACULTY[studentData.Faculty] || [];
    return (
      <select
        id="division"
        name="Division"
        value={studentData.Division}
        onChange={handleChange}
        className={selectClass}
        disabled={options.length === 0}
        required
      >
        <option value="">{options.length === 0 ? "Select faculty first" : "Select division"}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const renderYears = () => (
    <select id="year" name="Year" value={studentData.Year} onChange={handleChange} className={selectClass} required>
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderGroups = () => (
    <select id="group" name="Group" value={studentData.Group} onChange={handleChange} className={selectClass} required>
      <option value="">Select group</option>
      {GROUPS.map((option) => (
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
          Add student
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">Add a new student to the platform</p>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={studentData.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={studentData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={studentData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className={`${inputClass} pr-10`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="code" className={labelClass}>
                  University Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={studentData.code}
                  onChange={handleChange}
                  placeholder="Enter university code"
                  className={inputClass}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="faculty" className={labelClass}>
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  {renderFaculties()}
                </div>
                <div>
                  <label htmlFor="division" className={labelClass}>
                    Division <span className="text-red-500">*</span>
                  </label>
                  {renderDivisions()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="group" className={labelClass}>
                    Group <span className="text-red-500">*</span>
                  </label>
                  {renderGroups()}
                </div>
                <div>
                  <label htmlFor="year" className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  {renderYears()}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto text-white px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3"
                style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--color-brand-primary-hover)")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "var(--color-brand-primary)")}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Adding...
                  </span>
                ) : (
                  "Add Student"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
