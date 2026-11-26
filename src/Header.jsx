import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    try {
      logout();
    } catch {
      // be defensive: auth context may or may not expose logout
    }
    localStorage.removeItem("user");
    setOpen(false);
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

  if (user) {
    const role = String(user.role || "").toLowerCase();
    if (role === "instructor" || role === "admin") {
      links.push({ label: "Upload", path: "/upload", requiresAuth: true, isInstructor: true });
    }
    if (role === "admin") {
      links.push({ label: "Admin Dashboard", path: "/admin", requiresAuth: true, isAdmin: true });
      links.push({ label: "Add user", path: "/add-user", requiresAuth: true, isAdmin: true });
    }
  }

  const visibleLinks = links.filter((link) => {
    if (link.requiresAuth && !user) return false;
    return true;
  });

  const brand = (onClick) => (
    <Link to="/" className="no-underline text-inherit block" onClick={onClick}>
      <div className="flex flex-col items-start">
        <span className="text-xl lg:text-2xl font-extrabold tracking-tight leading-tight">
          <span style={{ color: "var(--color-brand-primary)" }}>OTU</span>
          <span style={{ color: "var(--color-brand-secondary)" }}>.hub</span>
        </span>
        <span className="text-[10px] lg:text-[11px] text-gray-400 tracking-[0.12em] uppercase mt-0.5 lg:mt-1">
          Platform
        </span>
      </div>
    </Link>
  );

  const navList = (onNavigate, className = "") => (
    <nav className={`flex flex-col gap-1.5 overflow-auto ${className}`}>
      {visibleLinks.map((link) => {
        const active = isActive(link.path);
        return (
          <Link
            key={link.path}
            to={link.path}
            onClick={onNavigate}
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
  );

  const signOut = user ? (
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
      className="w-full rounded-lg font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-colors px-3 py-2.5 no-underline hover:opacity-90"
      style={{
        border: "1px solid var(--color-brand-primary)",
        backgroundColor: "var(--color-brand-primary)",
        color: "var(--color-text-white)",
      }}
    >
      Sign in
    </Link>
  );

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 flex h-14 flex-row items-center justify-between border-b px-4 box-border lg:inset-y-0 lg:right-auto lg:h-auto lg:w-[220px] lg:flex-col lg:items-stretch lg:justify-start lg:border-b-0 lg:border-r lg:px-5 lg:py-5"
        style={{
          backgroundColor: "var(--color-bg-primary)",
          borderColor: "var(--color-border-primary)",
        }}
      >
        <div className="lg:mb-9">{brand()}</div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 cursor-pointer lg:hidden"
        >
          <FiMenu size={20} />
        </button>

        {navList(() => setOpen(false), "hidden lg:flex lg:flex-1")}

        <div className="hidden lg:block lg:mt-auto">{signOut}</div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute inset-y-0 left-0 flex w-[272px] max-w-[85vw] flex-col gap-5 border-r bg-white p-5 box-border"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="flex items-start justify-between gap-3">
              {brand(() => setOpen(false))}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>
            {navList(() => setOpen(false), "flex-1")}
            <div className="mt-auto">{signOut}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
