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
  const formattedTime = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" });
  return { formattedDate, formattedTime };
};

const OnlineMeetingCard = ({ meetings = [], loading = false }) => {
  const navigate = useNavigate();
  const displayItems = Array.isArray(meetings) ? meetings.slice(0, 5) : [];

  return (
    <article className="bg-white border-gray-200 rounded-xl overflow-hidden w-full shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] transition-[transform,box-shadow]">
      <div className="px-3 py-2 sm:px-4 sm:py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="m-0 text-sm sm:text-base font-bold text-gray-900 leading-snug max-w-[50%] truncate">
          Online Meetings
        </h3>
      </div>

      <div className="space-y-2 p-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <ListRowSkeleton key={`meeting-skeleton-${index}`} />
          ))
        ) : displayItems.length === 0  || !displayItems ? (
          <button
            key="meeting-placeholder-0"
            onClick={(e) => e.preventDefault()}
            className="w-full text-left bg-white border border-gray-200 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between gap-4 cursor-default"
          >
            <span className="text-sm font-medium text-gray-500 text-left">No online meetings added yet</span>
            <div className="text-right">
              <div className="text-xs text-gray-400">-</div>
            </div>
          </button>
        ) : (
          displayItems.map((item, index) => {
            const id = item.id || item._id || index;
            const title = item.title || item.name || "Untitled Meeting";
            const date = item.OnlineMeetingDate || item.meetingDate || item.date || item.createdAt || "";
            const daysLeft = getDaysLeft(date);
            const formatted = formatMeetingDateTime(date);

            if (daysLeft === -1) {
              if (id && id !== "0" && id !== 0) {
                api.delete(`/OnlineMeeting/${id}`).catch(() => {});
              }
              return null;
            }

            if (id === 0 || id === "0") {
              return (
                <button
                  key={id}
                  onClick={(e) => e.preventDefault()}
                  className="w-full text-left bg-white border border-gray-200 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between gap-4 cursor-default"
                >
                  <span className="text-sm font-medium text-gray-500 text-left">{title || "No online meetings added yet"}</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">-</div>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={id}
                onClick={() => navigate(`/meeting/${id}`, { state: { meeting: item } })}
                className="w-full text-left bg-white border border-gray-200 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              >
                <span className="text-sm font-medium text-gray-900 text-left max-w-[50%] truncate">{title}</span>
                <div className="text-right">
                  {formatted ? (
                    <>
                      <div className="text-xs text-gray-500 whitespace-nowrap">{formatted.formattedDate}</div>
                      {formatted.formattedTime ? (
                        <div className="text-xs text-gray-500 whitespace-nowrap">at {formatted.formattedTime}</div>
                      ) : null}
                    </>
                  ) : date ? (
                    <div className="text-xs text-gray-500 whitespace-nowrap">{date}</div>
                  ) : (
                    <div className="text-xs text-gray-500">No date</div>
                  )}
                  {daysLeft !== null ? (
                    <div className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-brand-primary)' }}>
                      {daysLeft === 0 ? "Today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>

      {Array.isArray(meetings) && meetings.length > 5 ? (
        <div className="px-4 py-3 sm:px-5 sm:py-3.5">
          <button
            onClick={() => navigate("/meetings")}
            className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 px-3.5 py-2.5"
          >
            Show all
          </button>
        </div>
      ) : null}
    </article>
  );
};

export default OnlineMeetingCard;