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

const ROLE_TABS = [
  { key: "student", label: "Student" },
  { key: "instructor", label: "Instructor" },
  { key: "admin", label: "Admin" },
];

const emptyUser = {
  name: "",
  email: "",
  password: "",
  code: "",
  Faculty: "",
  Division: "",
  Group: "",
  Year: "",
  nationalId: "",
};

const FIELD_LABELS = {
  name: "Full Name",
  email: "Email",
  password: "Password",
  code: "University Code",
  Faculty: "Faculty",
  Division: "Division",
  Group: "Group",
  Year: "Year",
  nationalId: "National ID",
};

const STUDENT_REQUIRED_FIELDS = [
  "name",
  "email",
  "password",
  "code",
  "Faculty",
  "Division",
  "Group",
  "Year",
];

const STAFF_REQUIRED_FIELDS = ["name", "email", "password", "nationalId"];

const findMissingFields = (data, requiredFields) =>
  requiredFields
    .filter((field) => !String(data[field] ?? "").trim())
    .map((field) => FIELD_LABELS[field] ?? field);

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof err?.plainMessage === "string" && err.plainMessage.trim())
    return err.plainMessage.trim();
  if (
    typeof err?.message === "string" &&
    err.message.trim() &&
    err.message !== "Request failed with status code"
  )
    return err.message.trim();

  if (data && typeof data === "object") {
    const direct =
      data.message ?? data.error ?? data.msg ?? data.title ?? data.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();

    if (data.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors)
        .flat()
        .find((item) => item);
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
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Password must contain at least one special character.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one capital letter.";
  }
  return null;
};

const isAdminUser = (user) =>
  String(user?.role ?? "").toLowerCase() === "admin";

const AddUser = () => {
  const { user, loading: authLoading, isGuest } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(emptyUser);
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState("student");

  const canAccessAddUser =
    String(user?.role ?? "").toLowerCase() === "admin" ||
    String(user?.role ?? "").toLowerCase() === "guest";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!canAccessAddUser) {
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate, authLoading, canAccessAddUser]);

  const isStaffTab = activeRole === "instructor" || activeRole === "admin";

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (isGuest) return;
    let nextValue = value;
    if (name === "name" && typeof value === "string") {
      nextValue = value.slice(0, 65);
    } else if (name === "email" && typeof value === "string") {
      nextValue = value.slice(0, 30);
    } else if (name === "code" && typeof value === "string") {
      nextValue = value.replace(/\D/g, "").slice(0, 5);
    } else if (name === "nationalId" && typeof value === "string") {
      nextValue = value.replace(/\D/g, "").slice(0, 20);
    }
    setUserData((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === "Faculty") {
        next.Division = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || isGuest) return;

    const requiredFields = isStaffTab ? STAFF_REQUIRED_FIELDS : STUDENT_REQUIRED_FIELDS;
    const missing = findMissingFields(userData, requiredFields);
    if (missing.length > 0) {
      ShowSnackBar(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }

    if (!isStaffTab) {
      const trimmedCode = String(userData.code ?? "").trim();
      if (trimmedCode.length !== 5) {
        ShowSnackBar("University Code must be exactly 5 characters.", "warn");
        return;
      }
    }

    const passwordError = validateNewPassword(userData.password);
    if (passwordError) {
      ShowSnackBar(passwordError, "warn");
      return;
    }

    setLoading(true);

    try {
      let payload;
      if (isStaffTab) {
        payload = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          nationalId: userData.nationalId,
          role: String(activeRole).toLowerCase(),
        };
      } else {
        payload = {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          code: userData.code,
          Faculty: userData.Faculty,
          Division: userData.Division,
          Group: userData.Group,
          Year: userData.Year,
          role: "student",
        };
      }

      const response = await api.post("/Reg/create", payload, {
        withCredentials: true,
      });
      const successMsg =
        response?.plainMessage ||
        response?.message ||
        (typeof response?.data === "string"
          ? response.data
          : response?.data?.message) ||
        "User added successfully.";
      ShowSnackBar(successMsg, "success");
      setUserData(emptyUser);
      setShowPassword(false);
    } catch (err) {
      ShowSnackBar(
        getErrorMessage(err, "Failed to add user. Please try again."),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || !canAccessAddUser) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";
  const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const fieldStyle = { borderColor: "var(--color-border-primary)" };
  const readOnlyClass = isGuest ? " opacity-60 pointer-events-none" : "";
  const readOnlyProps = isGuest ? { readOnly: true, disabled: true, tabIndex: -1 } : {};

  const renderFaculties = () => (
    <select
      id="faculty"
      name="Faculty"
      value={userData.Faculty}
      onChange={handleChange}
      className={`${selectClass}${readOnlyClass}`}
      style={fieldStyle}
      required={!isStaffTab}
      {...(isGuest ? { disabled: true } : {})}
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
    const options = DIVISIONS_BY_FACULTY[userData.Faculty] || [];
    return (
      <select
        id="division"
        name="Division"
        value={userData.Division}
        onChange={handleChange}
        className={`${selectClass}${readOnlyClass}`}
        style={fieldStyle}
        disabled={isGuest || options.length === 0}
        required={!isStaffTab}
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

  const renderYears = () => (
    <select
      id="year"
      name="Year"
      value={userData.Year}
      onChange={handleChange}
      className={`${selectClass}${readOnlyClass}`}
      style={fieldStyle}
      required={!isStaffTab}
      {...(isGuest ? { disabled: true } : {})}
    >
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderGroups = () => (
    <select
      id="group"
      name="Group"
      value={userData.Group}
      onChange={handleChange}
      className={`${selectClass}${readOnlyClass}`}
      style={fieldStyle}
      required={!isStaffTab}
      {...(isGuest ? { disabled: true } : {})}
    >
      <option value="">Select group</option>
      {GROUPS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Add user
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Add a new user to the platform
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-5 flex flex-wrap gap-2 justify-center sm:justify-start">
          {ROLE_TABS.map((tab) => {
            const isActive = activeRole === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveRole(tab.key)}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: "var(--color-brand-primary)",
                        borderColor: "var(--color-brand-primary)",
                      }
                    : { borderColor: "var(--color-border-primary)" }
                }
                aria-pressed={isActive}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className={labelClass}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  maxLength={65}
                  value={userData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={`${inputClass}${readOnlyClass}`}
                  style={fieldStyle}
                  required
                  {...readOnlyProps}
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
                    maxLength={30}
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    className={`${inputClass}${readOnlyClass}`}
                    style={fieldStyle}
                    required
                    {...readOnlyProps}
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
                      value={userData.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      className={`${inputClass} pr-10${readOnlyClass}`}
                      style={fieldStyle}
                      required
                      {...readOnlyProps}
                    />
                    <button
                      type="button"
                      onClick={() => !isGuest && setShowPassword((prev) => !prev)}
                      className={`absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 ${isGuest ? "opacity-60 pointer-events-none" : ""}`}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isGuest}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {isStaffTab ? (
                <div>
                  <label htmlFor="nationalId" className={labelClass}>
                    National ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    inputMode="numeric"
                    value={userData.nationalId}
                    onChange={handleChange}
                    placeholder="Enter national ID"
                    className={`${inputClass}${readOnlyClass}`}
                    style={fieldStyle}
                    required
                    {...readOnlyProps}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="code" className={labelClass}>
                      University Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="code"
                      name="code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={5}
                      value={userData.code}
                      onChange={handleChange}
                      placeholder="Enter university code"
                      className={`${inputClass}${readOnlyClass}`}
                      style={fieldStyle}
                      required
                      {...readOnlyProps}
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
                </>
              )}
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading || isGuest}
                className={`w-full sm:w-auto text-white px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] py-3 ${isGuest ? "opacity-60" : "disabled:opacity-85"}`}
                style={{
                  backgroundColor: "var(--color-brand-primary)",
                  color: "var(--color-text-white)",
                }}
                onMouseEnter={(e) => {
                  if (!isGuest) e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-brand-primary)";
                }}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      aria-hidden="true"
                    />
                    Adding...
                  </span>
                ) : (
                  "Add User"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
