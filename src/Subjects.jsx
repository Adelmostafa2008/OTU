import { useEffect, useState } from "react";
import { FiFolder, FiAlertCircle } from "react-icons/fi";
import api from "./AxiosHelper";
import { useAuth } from "./AuthContext";

// Subject names come back exactly as stored, often in lower case, so the first
// letter is capitalised for display.
const capitalizeName = (name) => {
  const trimmed = String(name ?? "").trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() + trimmed.slice(1) : "";
};

const Subjects = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = user?.id || user?.userId || user?._id;

  useEffect(() => {
    if (userId === undefined || userId === null || userId === "") return;

    let cancelled = false;
    const fetchSubjects = async () => {
      try {
        const res = await api.get(`/Student/subjects/${userId}`, { timeout: 15000 });
        if (cancelled) return;
        const data = res?.data;
        const list = Array.isArray(data) ? data : data ? [data] : [];
        setSubjects(
          list
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.name ?? item?.subject ?? item?.subjectName ?? "",
            )
            .filter((name) => String(name).trim() !== ""),
        );
        setError("");
      } catch {
        if (cancelled) return;
        setSubjects([]);
        setError("Couldn't load your subjects. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSubjects();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Subjects
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Browse your enrolled subjects
        </p>
      </div>

      {error && (
        <div
          className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm text-gray-700"
          style={{ borderColor: "var(--color-border-primary)" }}
        >
          <FiAlertCircle size={18} style={{ color: "var(--color-brand-primary)" }} />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4 w-full">
        {loading && Boolean(userId) ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`subject-skeleton-${index}`}
              className="h-[88px] bg-white border rounded-2xl animate-pulse"
              style={{ borderColor: "var(--color-border-primary)" }}
            />
          ))
        ) : subjects.length > 0 ? (
          subjects.map((name, index) => (
            <div
              key={`${name}-${index}`}
              className="bg-white border rounded-2xl transition-all"
              style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
            >
              <div className="w-full flex items-center gap-4 p-4 sm:p-5">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "color-mix(in srgb, var(--color-brand-primary) 10%, transparent)" }}
                >
                  <FiFolder style={{ color: "var(--color-brand-primary)" }} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 m-0 break-words">
                    {capitalizeName(name)}
                  </h3>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className="bg-white border rounded-2xl px-4 py-10 text-center text-sm text-gray-500"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            No subjects available
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
