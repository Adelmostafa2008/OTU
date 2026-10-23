import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnackbar } from "./SnackbarContext";

const LoginPage = () => {
  const { login } = useAuth();
  const { show, swallowNext } = useSnackbar();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email.trim() || !password.trim()) {
      show("Please fill in all fields.", "warning");
      swallowNext();
      setLocalError("Please fill in all fields.");
      return;
    }

    if (!email.includes("@")) {
      show("Please enter a valid email address.", "warning");
      swallowNext();
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

      const userData = response.data ? response.data : null;

      login(userData);
      const successMsg = response.data?.message ?? "Signed in successfully.";
      show(successMsg, response.data?.success === false ? "info" : "success");
      swallowNext();

      console.log("OTU.hub login response:", response.data);

      // Navigate based on role
      if (userData?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.msg ??
        null;

      const status = err?.response?.status;
      if (status === 401) {
        const msg = serverMsg ?? "Invalid email or password.";
        show(msg, "error");
        swallowNext();
        setLocalError(msg);
        return;
      }
      if (status === 400 && serverMsg) {
        show(serverMsg, "warning");
        swallowNext();
        setLocalError(serverMsg);
        return;
      }

      const msg = serverMsg ?? "Something went wrong. Please try again later.";
      show(msg, "error");
      swallowNext();
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-5 box-border font-sans antialiased">
      {/* ---------- Title ---------- */}
      <div className="text-center mb-11 select-none">
        <h1 className="m-0 text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
          <span className="text-teal-400">OTU</span>
          <span className="text-black">.hub</span>
        </h1>
      </div>

      {/* ---------- Card ---------- */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 sm:p-9 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] transition-shadow">
        <div className="mb-6">
          <h2 className="m-0 mb-1 text-xl font-bold text-gray-900">
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
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={1}
              className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-400 hover:bg-teal-300 text-white font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed disabled:opacity-85 active:scale-[0.99]"
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

        <p className="mt-5 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <span className="text-teal-400 font-semibold cursor-pointer">
            Create one
          </span>
        </p>
      </div>

      {/* ---------- Styles ---------- */}
      <style>{`\n        @keyframes snackbar-in {\n          0% { opacity: 0; transform: translateX(-50%) translateY(12px) scale(0.98); }\n          100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }\n        }\n      `}</style>
    </div>
  );
};

export default LoginPage;
