import { useNavigate } from "react-router-dom";
import { ListRowSkeleton } from "./Skeleton";
import api from "./AxiosHelper";

const getDaysLeft = (dateString) => {
  if (!dateString) return null;
  const eventDate = new Date(dateString);
  if (isNaN(eventDate.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);
  const diffTime = eventDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return -1;
  if (diffDays === 0) return 0;
  return diffDays;
};

const formatMeetingDateTime = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { formattedDate: dateString, formattedTime: null };
  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = date.toLocaleDateString(undefined, options);
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "numeric",
  });
  return { formattedDate, formattedTime };
};

const AssignmentCard = ({ assignments = [], loading = false, truncateTitles = false }) => {
  const navigate = useNavigate();
  const displayItems = Array.isArray(assignments) ? assignments.slice(0, 5) : [];

  return (
    <article
      className="bg-white border rounded-2xl overflow-hidden w-full"
      style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border-primary)", backgroundColor: "rgba(255,255,255,0.7)" }}
      >
        <h3 className="m-0 text-base sm:text-lg font-bold text-gray-900 leading-snug">
          Assignments
        </h3>
      </div>

      <div className="space-y-2.5 p-4 sm:p-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ListRowSkeleton key={`assignment-skeleton-${index}`} />
          ))
        ) : displayItems.length === 0 || !displayItems ? (
          <button
            key="assignment-placeholder-0"
            onClick={(e) => e.preventDefault()}
            className="w-full text-left bg-gray-50 border rounded-xl py-4 px-4 flex items-center justify-between gap-4 cursor-default"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <span className="text-sm font-medium text-gray-500 text-left">
              No assignments added yet
            </span>
            <div className="text-right">
              <div className="text-xs text-gray-400">-</div>
            </div>
          </button>
        ) : (
          displayItems.map((item, index) => {
            const id = item.id || item._id || index;
            const title = item.title || item.name || "Untitled Assignment";
            const date =
              item.deadline || item.Deadline || item.assignmentDate || item.date || item.OnlineMeetingDate || item.meetingDate || item.createdAt || "";
            const daysLeft = getDaysLeft(date);
            const formatted = formatMeetingDateTime(date);

            if (daysLeft === -1) {
              if (id && id !== "0" && id !== 0) {
                api.delete(`/assignment/${id}`).catch(() => {});
              }
              return null;
            }

            if (id === 0 || id === "0") {
              return (
                <button
                  key={id}
                  onClick={(e) => e.preventDefault()}
                  className="w-full text-left bg-gray-50 border rounded-xl py-3.5 px-4 flex items-center justify-between gap-4 cursor-default"
                  style={{ borderColor: "var(--color-border-primary)" }}
                >
                  <span className="text-sm font-medium text-gray-500 text-left">
                    {title || "No assignments added yet"}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">-</div>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                onClick={() => navigate(`/assignment/${id}`, { state: { assignment: item } })}
                className="w-full text-left bg-white border rounded-xl py-3.5 px-4 flex items-center justify-between gap-4 transition-all hover:-translate-y-[1px]"
                style={{ borderColor: "var(--color-border-primary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 18px rgba(16,24,40,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  className={`text-sm sm:text-[15px] font-semibold text-gray-900 text-left min-w-0 flex-1 ${
                    truncateTitles ? "truncate" : "break-words"
                  }`}
                  title={truncateTitles ? title : undefined}
                >
                  {title}
                </span>
                <div className="text-right flex-shrink-0">
                  {formatted ? (
                    <>
                      <div className="text-xs text-gray-500 whitespace-nowrap">
                        {formatted.formattedDate}
                      </div>
                      {formatted.formattedTime ? (
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          at {formatted.formattedTime}
                        </div>
                      ) : null}
                    </>
                  ) : date ? (
                    <div className="text-xs text-gray-500 whitespace-nowrap">{date}</div>
                  ) : (
                    <div className="text-xs text-gray-500">No date</div>
                  )}
                  {daysLeft !== null ? (
                    <div
                      className="text-xs font-semibold whitespace-nowrap mt-0.5"
                      style={{ color: "var(--color-brand-primary)" }}
                    >
                      {daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      {Array.isArray(assignments) && assignments.length > 5 ? (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <button
            onClick={() => navigate("/assignments")}
            className="w-full rounded-xl border bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 px-3.5 py-2.5"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            Show all
          </button>
        </div>
      ) : null}
    </article>
  );
};

export default AssignmentCard;
