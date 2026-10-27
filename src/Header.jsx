import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FiLogOut } from "react-icons/fi";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
    } catch {
      // be defensive: auth context may or may not expose logout
    }
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const links = [
    { label: "Home", path: "/" },
    { label: "Subjects", path: "/subjects", requiresAuth: true },
    { label: "Profile", path: "/profile", requiresAuth: true },
  ];

  // Add role-specific links
  if (user) {
    // Admin can access all pages except upload? Wait - "student can access all pages except the admindashboard and the upload page , instructor can access all pages except admindashcoard , admin can access all pages"
    // So admin can access upload? "admin can access all pages" - so yes
    // Instructor can access upload (not admin dashboard)
    // Student cannot access upload
    if (user.role === "instructor" || user.role === "admin") {
      links.push({ label: "Upload Lesson", path: "/upload", requiresAuth: true, isInstructor: true });
    }
    if (user.role === "admin") {
      links.push({ label: "Admin Dashboard", path: "/admin", requiresAuth: true, isAdmin: true });
    }
  }

  // Filter links based on auth status
  const visibleLinks = links.filter((link) => {
    if (link.requiresAuth && !user) return false;
    return true;
  });

  return (
    <header className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col p-4 sm:p-5 box-border z-50" style={{ backgroundColor: 'var(--color-bg-primary)', borderRight: '1px solid var(--color-border-primary)' }}>
      <div className="mb-9 flex-0 0 auto">
        <Link to="/" className="no-underline text-inherit block">
          <div className="flex flex-col items-start">
            <span className="text-2xl font-extrabold tracking-tight leading-tight">
              <span style={{ color: 'var(--color-brand-primary)' }}>OTU</span>
              <span style={{ color: 'var(--color-brand-secondary)' }}>.hub</span>
            </span>
            <span className="text-[11px] text-gray-400 tracking-[0.12em] uppercase mt-1">
              Platform
            </span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5 overflow-auto">
        {visibleLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`no-underline block rounded-lg transition-colors ${active
                  ? "bg-gray-100 text-gray-900 font-semibold pl-3 pr-3 py-2.5"
                  : link.isAdmin || link.isInstructor
                  ? "font-semibold pl-3 pr-3 py-2.5"
                  : "text-gray-500 font-medium pl-3 pr-3 py-2.5 hover:bg-gray-50"
                }`}
              style={
                active
                  ? { borderLeft: "3px solid var(--color-brand-primary)" }
                  : link.isAdmin || link.isInstructor
                  ? { color: "var(--color-brand-primary)" }
                  : {}
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex-0 0 auto">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold text-sm cursor-pointer flex items-center gap-2 transition-colors hover:bg-red-50 hover:border-red-300 active:bg-red-100 px-3 py-2.5"
          >
            <FiLogOut className="shrink-0" size={16} />
            Sign out
          </button>
        ) : (
          <Link
            to="/login"
            className="w-full rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors px-3 py-2.5 no-underline"
            style={{ border: "1px solid var(--color-brand-primary)", backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "var(--color-brand-primary-hover)"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "var(--color-brand-primary)"}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
