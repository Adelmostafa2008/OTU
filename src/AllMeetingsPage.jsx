import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./AxiosHelper";
import { useAuth } from "./AuthContext";
import { ListRowSkeleton } from "./Skeleton";
import { guestMeetings } from "./props";

const PAGE_SIZE = 12;

const formatMeetingDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { formattedDate: dateString, formattedTime: null };
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString(undefined, options);
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
  });
  return { formattedDate, formattedTime };
};

const extractItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.meetings)) return payload.meetings;
  return [];
};

const extractTotalPages = (payload, itemsLength, page) => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const raw =
      payload.totalPages ??
      payload.total_pages ??
      payload.pages ??
      payload.pageCount ??
      payload.page_count;
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.max(1, Math.ceil(n));
    const total =
      payload.total ??
      payload.totalCount ??
      payload.total_count ??
      payload.count;
    const t = Number(total);
    if (Number.isFinite(t) && t >= 0) return Math.max(1, Math.ceil(t / PAGE_SIZE));
  }
  if (itemsLength === 0) return Math.max(1, page);
  if (itemsLength < PAGE_SIZE) return page;
  return page + 1;
};

const AllMeetingsPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isGuest } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (authLoading) return;
    if (isGuest || !user) return;

    const userId = user?.id || user?.userId || user?._id;
    if (userId === undefined || userId === null || userId === "") return;

    let cancelled = false;
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/Student/meeting/${userId}?IsCard=false&PageNum=${page}`,
          { timeout: 15000 }
        );
        if (cancelled) return;
        const payload = res?.data;
        const items = extractItems(payload);
        setMeetings(items);
        setTotalPages(extractTotalPages(payload, items.length, page));
      } catch {
        if (!cancelled) {
          setMeetings([]);
          setTotalPages(Math.max(1, page));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMeetings();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, page, isGuest]);

  const displayMeetings = isGuest ? guestMeetings : meetings;
  const showLoading = !isGuest && (authLoading || (loading && !!user));

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Online Meetings
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          All online meetings
        </p>
      </div>

      <div className="w-full space-y-3">
        {showLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <ListRowSkeleton key={`meeting-row-skeleton-${index}`} />
          ))
        ) : displayMeetings.length === 0 ? (
          <div
            className="w-full bg-white border rounded-2xl px-5 py-8 text-sm text-gray-500 text-center"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            No online meetings added yet
          </div>
        ) : (
          displayMeetings.map((item, index) => {
            const id = item.id || item._id || `${page}-${index}`;
            const title = item.title || item.name || "Untitled Meeting";
            const date =
              item.meetingdate || item.date || item.meetingDate || item.OnlineMeetingDate || "";
            const formatted = formatMeetingDateTime(date);
            const description = item.description || item.notes || null;

            return (
              <button
                key={id}
                onClick={() => navigate(`/meeting/${id}`, { state: { meeting: item } })}
                className="w-full text-left bg-white border rounded-2xl px-5 py-4 flex items-center justify-between gap-4 transition-all hover:-translate-y-[1px]"
                style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-base font-semibold text-gray-900 break-words block">
                    {title}
                  </span>
                  {description ? (
                    <p
                      className="m-0 text-sm text-gray-600 leading-relaxed mt-1 break-words w-full"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={String(description)}
                    >
                      {description}
                    </p>
                  ) : null}
                </div>
                {formatted ? (
                  <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                    {formatted.formattedTime
                      ? `${formatted.formattedDate} • ${formatted.formattedTime}`
                      : formatted.formattedDate}
                  </span>
                ) : null}
              </button>
            );
          })
        )}

        {!showLoading && !isGuest && (displayMeetings.length > 0 || page > 1) ? (
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page}{totalPages > page ? ` of ${totalPages}` : ""}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={loading || page >= totalPages}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AllMeetingsPage;
