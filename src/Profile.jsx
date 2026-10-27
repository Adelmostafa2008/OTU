import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [phone, setPhone] = useState(user?.phone || "");
  const [isEditingPhone, setIsEditingPhone] = useState(!user?.phone);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || "");
      setIsEditingPhone(!user.phone);
    }
  }, [user]);

  const handlePhoneSave = async () => {
    if (!phone.trim()) {
      ShowSnackBar("Please enter a phone number.", "warn");
      return;
    }

    setLoading(true);
    try {
      // URL left empty as requested
      await api.post("", { phone: phone.trim() });
      updateUser({ phone: phone.trim() });
      setIsEditingPhone(false);
      ShowSnackBar("Phone number updated successfully.", "success");
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        null;
      ShowSnackBar(serverMsg || "Failed to update phone number.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneEdit = () => {
    setIsEditingPhone(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Profile
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">No user data available.</p>
      </div>
    );
  }

  const fields = [
    { label: "Name", value: user.username || user.name || "-" },
    { label: "Email", value: user.email || "-" },
    { label: "Role", value: user.role || "-" },
    { label: "Code", value: user.code || user.id || "-" },
    { label: "Faculty", value: user.faculty || "-" },
    { label: "Division", value: user.division || "-" },
    { label: "Group", value: user.group || user.Group || "-" },
    { label: "Password", value: user.password ? "********" : "-" },
  ];

  return (
    <div className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border">
      <div className="mb-8">
        <h1 className="m-0 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Profile
        </h1>
        <p className="m-0 mt-2 text-sm text-gray-500">
          Your profile details
        </p>
      </div>

      <div className="max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
            <p className="m-0 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {field.label}
            </p>
            <p className="m-0 text-sm text-gray-900">{field.value}</p>
          </div>
        ))}

        <div className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
          <p className="m-0 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Phone Number
          </p>
          {isEditingPhone ? (
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                onClick={handlePhoneSave}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:cursor-not-allowed disabled:opacity-85" style={{ backgroundColor: 'var(--color-brand-primary)', color: 'var(--color-text-white)' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary-hover)'} onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-brand-primary)' }
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="m-0 text-sm text-gray-900 flex-1">{phone}</p>
              <button
                onClick={handlePhoneEdit}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50"
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
