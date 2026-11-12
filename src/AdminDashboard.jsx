import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "admin" && user.role !== "guest") {
      navigate("/", { replace: true });
      return;
    }
  }, [user, navigate]);

  if (!user || (user.role !== "admin" && user.role !== "guest")) {
    return null;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        className="bg-white border rounded-2xl px-8 py-10 sm:px-12 sm:py-14 text-center max-w-xl w-full"
        style={{
          borderColor: "var(--color-border-primary)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p className="m-0 text-xl sm:text-2xl font-bold text-gray-900">
          Still in development process
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
