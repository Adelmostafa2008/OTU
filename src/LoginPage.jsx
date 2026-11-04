import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const { ShowSnackBar } = useSnack();
  const [cool, setCool] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handelSnack = (msg, ty) => {
    if(!cool){
      setCool(true);
      ShowSnackBar(msg, ty);
      setTimeout(() => {
        setCool(false);
      }, 5000);
    } 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password.trim()) {
      setLocalError("Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // ---- URL is left empty on purpose. Fill it in later. ----
      const response = await api.post(
        "/reg/login",
        { email: email.trim(), password },
      );

      const data = response?.data;
      const userData = typeof data === "object" && data !== null ? data : null;

      login(userData);
      const successMsg =
        response?.plainMessage ||
        response?.message ||
        (typeof data === "string" ? data : data?.message) ||
        "Signed in successfully.";
      const isError = typeof data === "object" && data?.success === false;
      handelSnack(successMsg, isError ? "info" : "success");

      // Navigate based on role
      if (userData?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const serverMsg =
        err?.plainMessage ||
        err?.message ||
        err?.response?.plainMessage ||
        err?.response?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.msg ||
        null;

      const status = err?.response?.status;
      if (status === 401) {
        const msg = serverMsg ?? "Invalid email or password.";
        handelSnack(msg, "error");
        return;
      }
      if (status === 400 && serverMsg) {
        handelSnack(serverMsg, "warn");
        return;
      }

      const msg = serverMsg ?? "Invalid Email Or Password.";
      handelSnack(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white px-5 pt-10 sm:pt-16 box-border font-sans antialiased">
      {/* ---------- Title ---------- */}
      <div className="text-center mb-10 sm:mb-12 select-none w-full">
        <h1 className="m-0 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight ">
          <span style={{ color: 'var(--color-brand-primary)' }}>OTU</span>
          <span style={{ color: 'var(--color-brand-secondary)' }}>.hub</span>
        </h1>
      </div>

      {/* ---------- Card ---------- */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-9 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] transition-shadow">
        <div className="mb-6">
          <h2 className="m-0 mb-1 text-xl font-bold text-gray-900 max-w-[50%] truncate">
            Welcome back
          </h2>
          <p className="m-0 text-sm text-gray-500">
            Sign in to your OTU.hub account
          </p>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-3.5 mb-4 text-sm text-red-700">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={1}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] px-3.5 py-3" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      {/* ---------- Styles ---------- */}
      <style>{`\n        @keyframes snackbar-in {\n          0% { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.98); }\n          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }\n        }\n      `}</style>
    </div>
  );
};

export default LoginPage;
