import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ChangePassword = () => {
  const { user, isGuest } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
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
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateNewPassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/]/.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one capital letter.";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    e.preventDefault();

    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      handelSnack("Please fill in all fields.", "warn");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      handelSnack("New password and confirm password do not match.", "warn");
      return;
    }

    const passwordError = validateNewPassword(formData.newPassword);
    if (passwordError) {
      handelSnack(passwordError, "warn");
      return;
    }

    setLoading(true);
    try {
      const userid =
        user?.id ||
        user?.userId ||
        user?._id ||
        user?.Id ||
        user?.userID ||
        user?.userid ||
        "";

      const res = await api.post("/Student/newpass", {
        userid,
        oldpassword: formData.oldPassword,
        newpassword: formData.newPassword,
      });
      const successMsg =
        res?.plainMessage ||
        res?.message ||
        (typeof res?.data === "string" ? res.data : null) ||
        "Password changed successfully.";
      handelSnack(successMsg, "success");
      navigate("/profile");
    } catch (err) {
      const errMsg =
        err?.plainMessage ||
        err?.message ||
        err?.response?.plainMessage ||
        err?.response?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        "Failed to change password.";
      handelSnack(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-2">
        <h1 className="m-0 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Change Password
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">No user data available.</p>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-xl border bg-white px-3.5 py-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Change Password
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Update your account password
        </p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Old Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input readOnly={isGuest} disabled={isGuest}
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className={fieldClass}
                    style={{ borderColor: "var(--color-border-primary)" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input readOnly={isGuest} disabled={isGuest}
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={fieldClass}
                    style={{ borderColor: "var(--color-border-primary)" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input readOnly={isGuest} disabled={isGuest}
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={fieldClass}
                    style={{ borderColor: "var(--color-border-primary)" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || isGuest}
                className="px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] py-3"
                style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")
                }
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 rounded-xl border bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 py-3"
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

export default ChangePassword;
