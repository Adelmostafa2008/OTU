import React from "react";

const getLessonTypeStyle = (type) => {
  const key = type == null ? "" : String(type).trim().toLowerCase();
  if (key === "lecture") {
    return "bg-blue-500/15 border-blue-500 text-blue-700";
  }
  if (key === "lab") {
    return "bg-red-500/15 border-red-500 text-red-700";
  }
  return key ? "bg-gray-500/15 border-gray-500 text-gray-700" : "";
};

const LessonCard = ({
  image = "https://picsum.photos/seed/lesson/320/180",
  title = "",
  subject = "",
  description = null,
  type = null,
  truncateTitle = false,
  truncateNotes = false,
}) => {
  const displayDescription =
    description === null || description === undefined ? "" : description;
  const normalizedType = type == null ? "" : String(type).trim();
  const typeBlobClass = getLessonTypeStyle(normalizedType);

  return (
    <article
      className="bg-white border rounded-2xl w-full h-full flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex-shrink-0 h-1/2 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover block"
          style={{ borderBottom: "1px solid var(--color-border-primary)" }}
        />
      </div>

      <div className="px-4 py-3 sm:px-4 sm:py-3.5 flex flex-col gap-1.5 flex-1 min-h-0 min-w-0">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <h3
            className={`m-0 text-base font-bold text-gray-900 leading-snug min-w-0 flex-1 ${
              truncateTitle ? "truncate" : "break-words"
            }`}
            title={truncateTitle ? title : undefined}
          >
            {title}
          </h3>
          {normalizedType ? (
            <span
              className={`flex-shrink-0 inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-xs font-semibold leading-none ${typeBlobClass}`}
              aria-label={`Lesson type: ${normalizedType}`}
            >
              {normalizedType}
            </span>
          ) : null}
        </div>

        <span
          className="text-xs font-semibold tracking-[0.06em] uppercase break-words"
          style={{ color: "var(--color-brand-primary)" }}
        >
          {subject}
        </span>

        <div className="mt-1 flex-1 min-h-0 min-w-0">
          <p
            className={`m-0 text-sm text-gray-600 leading-relaxed w-full ${
              truncateNotes ? "break-words" : "whitespace-normal break-words"
            }`}
            style={
              truncateNotes
                ? {
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }
                : undefined
            }
            title={truncateNotes ? String(displayDescription ?? "") : undefined}
          >
            {displayDescription}
          </p>
        </div>
      </div>
    </article>
  );
};

export default LessonCard;
