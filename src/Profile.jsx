import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import {
  FiBookOpen,
  FiCheck,
  FiEdit2,
  FiGrid,
  FiHash,
  FiLock,
  FiMail,
  FiPhone,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";

const OLIVE = "#91b141";
const OLIVE_DARK = "#7c9b36";
const OLIVE_SOFT = "#F1F6E4";
const OLIVE_LINE = "#DCE7C8";
const LINE = "#E5E7EB";

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof err?.plainMessage === "string" && err.plainMessage.trim())
    return err.plainMessage.trim();
  if (typeof err?.message === "string" && err.message.trim()) return err.message.trim();
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

const hasValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const getInitials = (name, email) => {
  const source = hasValue(name) ? String(name).trim() : String(email ?? "");
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const InfoField = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`min-w-0 bg-white p-4 sm:p-5 ${className}`}>
    <div className="flex items-center gap-2">
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ background: OLIVE_SOFT, color: OLIVE_DARK }}
      >
        <Icon size={15} />
      </span>
      <p className="m-0 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
    </div>
    <p className="m-0 mt-3 text-sm font-semibold leading-snug text-gray-900 break-words sm:text-[15px]">
      {value}
    </p>
  </div>
);

const ProfilePage = () => {
  const { user, updateUser, isGuest } = useAuth();
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
  const [phone, setPhone] = useState(user?.phone || "");
  const [isEditingPhone, setIsEditingPhone] = useState(!user?.phone);
  const [loading, setLoading] = useState(false);

  // Phone form state is reset by remounting the profile card when user identity/phone changes.

  const handlePhoneSave = async () => {
    if (isGuest) return;
    if (!phone.trim()) {
      handelSnack("Please enter a phone number.", "warn");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post(`/Student/phone/${user.id}`, phone, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const savedPhone = res?.data?.phone ?? phone;
      updateUser({ phone: savedPhone });
      setPhone(savedPhone);
      setIsEditingPhone(false);
      const successMsg =
        (typeof res?.data === "string" ? res.data : null) ||
        res?.data?.message ||
        res?.message ||
        "Phone number updated successfully.";
      handelSnack(successMsg, "success");
    } catch (err) {
      handelSnack(getErrorMessage(err, "Failed to update phone number."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneEdit = () => {
    if (isGuest) return;
    setIsEditingPhone(true);
  };

  const handlePhoneCancel = () => {
    if (isGuest) return;
    setPhone(user?.phone || "");
    setIsEditingPhone(!user?.phone);
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto w-full space-y-2">
        <h1 className="m-0 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Profile
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">No user data available.</p>
      </div>
    );
  }

  const nameValue = user.username ?? user.name;
  const groupValue = user.group ?? user.Group;
  const roleValue = hasValue(user.role) ? String(user.role) : "";

  const details = [
    { label: "Code", value: user.code, icon: FiHash },
    { label: "Faculty", value: user.faculty, icon: FiBookOpen },
    { label: "Division", value: user.division, icon: FiGrid },
    { label: "Group", value: groupValue, icon: FiUsers },
  ].filter((field) => hasValue(field.value));

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Profile
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Your account details and contact information
        </p>
      </div>

      <div
        key={user ? `${user.id ?? "user"}-${user.phone ?? ""}` : "nouser"}
        className="space-y-4 sm:space-y-5"
      >
        <section
          className="overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: LINE, boxShadow: "var(--shadow-card)" }}
        >
          <div className="h-1.5 w-full" style={{ background: OLIVE }} aria-hidden="true" />
          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-7">
            <div
              className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border text-xl font-extrabold sm:h-[72px] sm:w-[72px] sm:text-2xl"
              style={{
                background: OLIVE_SOFT,
                borderColor: OLIVE_LINE,
                color: OLIVE_DARK,
              }}
              aria-hidden="true"
            >
              {getInitials(nameValue, user.email)}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="m-0 text-xl font-extrabold tracking-tight text-gray-900 break-words sm:text-2xl">
                {hasValue(nameValue) ? nameValue : "Unnamed account"}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {roleValue && (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ background: OLIVE_SOFT, color: OLIVE_DARK }}
                  >
                    <FiUserCheck size={11} />
                    {roleValue}
                  </span>
                )}
                {hasValue(user.code) && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600">
                    ID {user.code}
                  </span>
                )}
              </div>
              {hasValue(user.email) && (
                <p className="m-0 mt-2 flex items-center gap-1.5 text-sm text-gray-500 break-all">
                  <FiMail size={13} className="flex-shrink-0 text-gray-400" />
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {details.length > 0 && (
            <div
              className="grid gap-px border-t sm:grid-cols-2"
              style={{ background: LINE, borderColor: LINE }}
              aria-label="Account details"
            >
              {details.map((field, index) => (
                <InfoField
                  key={field.label}
                  icon={field.icon}
                  label={field.label}
                  value={field.value}
                  className={
                    details.length % 2 === 1 && index === details.length - 1
                      ? "sm:col-span-2"
                      : ""
                  }
                />
              ))}
            </div>
          )}

          <div className="border-t p-4 sm:p-5" style={{ borderColor: LINE }}>
            <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: OLIVE_SOFT, color: OLIVE_DARK }}
            >
              <FiPhone size={15} />
            </span>
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
              Phone number
            </p>
          </div>

          {isEditingPhone ? (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                readOnly={isGuest}
                disabled={isGuest}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{0,11}"
                maxLength={11}
                value={phone}
                onChange={(e) => {
                  if (isGuest) return;
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 11);
                  setPhone(value);
                }}
                placeholder="Enter your phone number"
                aria-label="Phone number"
                className="min-w-0 flex-1 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-[#9ec246]/20 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: LINE }}
              />
              <div className="flex flex-shrink-0 items-center gap-2">
                <button
                  onClick={handlePhoneSave}
                  disabled={loading || isGuest}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                  style={{ backgroundColor: OLIVE, color: "#FFFFFF" }}
                  onMouseEnter={(e) => {
                    if (!isGuest && !loading) e.currentTarget.style.backgroundColor = OLIVE_DARK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = OLIVE;
                  }}
                >
                  <FiCheck size={15} />
                  {loading ? "Saving..." : "Save"}
                </button>
                {user?.phone && !isGuest && (
                  <button
                    onClick={handlePhoneCancel}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    style={{ borderColor: LINE }}
                  >
                    <FiX size={15} />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="m-0 text-sm font-semibold text-gray-900 break-words sm:text-[15px]">
                {phone}
              </p>
              <button
                onClick={handlePhoneEdit}
                disabled={isGuest}
                className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                style={{ borderColor: LINE }}
              >
                <FiEdit2 size={14} />
                Edit
              </button>
            </div>
          )}
          </div>
        </section>

        <section
          className="flex flex-col gap-4 rounded-2xl border bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          style={{ borderColor: LINE, boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)" }}
        >
          <div className="flex items-start gap-3">
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
              style={{ background: OLIVE_SOFT, color: OLIVE_DARK }}
            >
              <FiLock size={16} />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-bold text-gray-900">Password</p>
              <p className="m-0 mt-0.5 text-[13px] leading-relaxed text-gray-500">
                Update the password used to sign in to your account.
              </p>
            </div>
          </div>
          <button
            onClick={() => !isGuest && navigate("/change-password")}
            disabled={isGuest}
            className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: LINE }}
          >
            Change password
          </button>
        </section>

        {isGuest && (
          <p className="m-0 px-1 text-[13px] leading-relaxed text-gray-500">
            Guest accounts are read-only. Phone and password changes are disabled.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
