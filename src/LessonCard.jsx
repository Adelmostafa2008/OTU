import React from "react";

const LessonCard = ({
  image = "https://picsum.photos/seed/lesson/320/180",
  title = "",
  subject = "",
  description = null,
}) => {
  const displayDescription = description === null || description === undefined ? "" : description;

  return (
    <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden w-full h-full shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] flex flex-col">
      <div className="flex-0 0 auto h-1/2">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover block border-b border-gray-200"
        />
      </div>

      <div className="px-4 py-3 sm:px-4 sm:py-3.5 flex flex-col gap-1.5 flex-1 min-h-0 overflow-hidden">
        <h3 className="m-0 text-base font-bold text-gray-900 leading-snug overflow-hidden text-ellipsis whitespace-nowrap w-full">
          {title}
        </h3>

        <span
          className="text-xs font-semibold tracking-[0.06em] uppercase"
          style={{ color: "var(--color-brand-primary)" }}
        >
          {subject}
        </span>

        <div className="mt-1 flex-1 min-h-0 overflow-hidden">
          <p className="m-0 text-sm text-gray-600 leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap w-full">
            {displayDescription}
          </p>
        </div>
      </div>
    </article>
  );
};

export default LessonCard;
