import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";

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

const ProfilePage = () => {
  const { user, updateUser, isGuest } = useAuth();
  const navigate = useNavigate();
  const { ShowSnackBar } = useSnack();
  const [phone, setPhone] = useState(user?.phone || "");
  const [isEditingPhone, setIsEditingPhone] = useState(!user?.phone);
  const [loading, setLoading] = useState(false);

  // Phone form state is reset by remounting the profile card when user identity/phone changes.

  const handlePhoneSave = async () => {
    if (isGuest) return;
    if (!phone.trim()) {
      ShowSnackBar("Please enter a phone number.", "warn");
      return;
    }

    setLoading(true);
    try {
      
      const res = await api.post(
        `/Student/phone/${user.id}`,
        phone,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const savedPhone = res?.data?.phone ?? phone;
      updateUser({ phone: savedPhone });
      setPhone(savedPhone);
      setIsEditingPhone(false);
      const successMsg =
        (typeof res?.data === "string" ? res.data : null) ||
        res?.data?.message ||
        res?.message ||
        "Phone number updated successfully.";
      ShowSnackBar(successMsg, "success");
    } catch (err) {
      ShowSnackBar(getErrorMessage(err, "Failed to update phone number."), "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneEdit = () => {
    if (isGuest) return;
    setIsEditingPhone(true);
  };

  if (!user) {
    return (
      <div className="space-y-2 max-w-2xl mx-auto">
        <h1 className="m-0 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Profile
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">No user data available.</p>
      </div>
    );
  }

  const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== "";

  const nameValue = user.username ?? user.name;
  const groupValue = user.group ?? user.Group;

  const fields = [
    { label: "Name", value: nameValue, visible: hasValue(nameValue) },
    { label: "Email", value: user.email, visible: hasValue(user.email) },
    { label: "Role", value: user.role, visible: hasValue(user.role) },
    { label: "Code", value: user.code, visible: hasValue(user.code) },
    { label: "Faculty", value: user.faculty, visible: hasValue(user.faculty) },
    { label: "Division", value: user.division, visible: hasValue(user.division) },
    { label: "Group", value: groupValue, visible: hasValue(groupValue) },
    { label: "Password", visible: true },
  ].filter((field) => field.visible);

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Profile
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Your profile details
        </p>
      </div>

      <div
        key={user ? `${user.id ?? "user"}-${user.phone ?? ""}` : "nouser"}
        className="max-w-3xl mx-auto w-full bg-white border rounded-2xl p-6 sm:p-8 space-y-4"
        style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
      >
        {fields.map((field, index) => (
          <div
            key={index}
            className="border-b pb-4 last:border-b-0 last:pb-0 min-w-0"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <p className="m-0 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {field.label}
            </p>
            {field.label === "Password" ? (
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => !isGuest && navigate("/change-password")}
                  disabled={isGuest}
                  className={`px-4 py-2 my-1 rounded-xl border bg-white text-gray-900 font-semibold text-sm transition-colors ${isGuest ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}
                  style={{ borderColor: "var(--color-border-primary)" }}
                >
                  Change password
                </button>
              </div>
            ) : (
              <p className="m-0 text-sm sm:text-base text-gray-900 whitespace-normal break-words w-full">
                {field.value}
              </p>
            )}
          </div>
        ))}

        <div className="pt-1 min-w-0">
          <p className="m-0 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Phone Number
          </p>
          {isEditingPhone ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
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
                className={`flex-1 min-w-0 rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4 ${isGuest ? "opacity-60 pointer-events-none" : ""}`}
                style={{ borderColor: "var(--color-border-primary)" }}
              />
              <button
                onClick={handlePhoneSave}
                disabled={loading || isGuest}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-85 flex-shrink-0"
                style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")
                }
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 min-w-0">
              <p className="m-0 text-sm sm:text-base text-gray-900 flex-1 min-w-0 whitespace-normal break-words">
                {phone}
              </p>
              <button
                onClick={handlePhoneEdit}
                disabled={isGuest}
                className={`px-4 py-2 rounded-xl border bg-white text-gray-900 font-semibold text-sm transition-colors flex-shrink-0 ${isGuest ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}
                style={{ borderColor: "var(--color-border-primary)" }}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
