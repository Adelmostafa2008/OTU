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
    if (!cool) {
      setCool(true);
      ShowSnackBar(msg, ty);
      setTimeout(() => {
        setCool(false);
      }, 5000);
    }
  };

  const handleLoginRequest = async (credentials) => {
    setLoading(true);
    setLocalError("");
    try {
      const response = await api.post("/reg/login", credentials);

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

    await handleLoginRequest({ email: email.trim(), password });
  };

  const handleGuestLogin = async () => {
    await handleLoginRequest({ email: "guest@otu.eg", password: "Guest123;" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 box-border font-sans antialiased">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 select-none w-full">
          <h1 className="m-0 text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            <span style={{ color: "var(--color-brand-primary)" }}>OTU</span>
            <span style={{ color: "var(--color-brand-secondary)" }}>.hub</span>
          </h1>
          <p className="m-0 mt-2 text-sm text-gray-500">Sign in to continue</p>
        </div>

        <div
          className="w-full bg-white border rounded-2xl px-5 py-4 mb-4 flex items-center justify-between gap-4"
          style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
        >
          <span className="text-sm sm:text-base font-semibold text-gray-900">
            Continue as a guest
          </span>
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center justify-center rounded-xl font-semibold text-sm px-6 py-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")
            }
            aria-label="Continue as a guest"
            title="Login as guest"
          >
            Login
          </button>
        </div>

        <div
          className="w-full bg-white border rounded-3xl p-7 sm:p-8"
          style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="mb-6">
            <h2 className="m-0 mb-1 text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="m-0 text-sm text-gray-500">Sign in to your OTU.hub account</p>
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
                className="w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4"
                style={{ borderColor: "var(--color-border-primary)" }}
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
                  className="w-full rounded-xl border bg-white px-3.5 py-3 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4"
                  style={{ borderColor: "var(--color-border-primary)" }}
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
              className="w-full rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99] px-3.5 py-3"
              style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")
              }
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
      </div>

      <style>{`
 @keyframes snackbar-in {
 0% { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.98); }
 100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
 }
 `}</style>
    </div>
  );
};

export default LoginPage;
