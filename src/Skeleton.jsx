import React from "react";

/**
 * Base skeleton block.
 * Uses the `.skeleton` shimmer animation defined in index.css.
 */
export const Skeleton = ({ className = "", style }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
);

/** A few lines of fake text. */
export const SkeletonText = ({ lines = 2, className = "" }) => (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className={`h-3 ${index === lines - 1 ? "w-2/3" : "w-full"}`}
      />
    ))}
  </div>
);

/** Matches the shape of LessonCard. */
export const LessonCardSkeleton = () => (
  <article
    className="bg-white border border-gray-200 rounded-2xl overflow-hidden w-full h-full shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] flex flex-col"
    aria-hidden="true"
  >
    <div className="h-1/2 border-b border-gray-200">
      <Skeleton className="w-full h-full rounded-none" />
    </div>
    <div className="px-4 py-3 sm:px-4 sm:py-3.5 flex flex-col gap-2 flex-1 min-h-0">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-2.5 w-1/3" />
      <Skeleton className="h-3 w-full mt-1" />
    </div>
  </article>
);

/** Matches one row inside QuizExamCard / OnlineMeetingCard. */
export const ListRowSkeleton = () => (
  <div
    className="w-full bg-white border border-gray-200 rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 flex items-center justify-between gap-4"
    aria-hidden="true"
  >
    <Skeleton className="h-3.5 w-1/2" />
    <div className="flex flex-col items-end gap-1.5">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-2.5 w-12" />
    </div>
  </div>
);

/** Matches the rows of AllQuizzesPage / AllMeetingsPage lists. */
export const ListItemSkeleton = () => (
  <div
    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]"
    aria-hidden="true"
  >
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-2/5" />
      <Skeleton className="h-3 w-3/4" />
    </div>
    <Skeleton className="h-3 w-16" />
  </div>
);

/** Matches a details page (title + date + info card). */
export const DetailPageSkeleton = () => (
  <div
    className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border"
    aria-hidden="true"
  >
    <div className="mb-8 space-y-4">
      <Skeleton className="h-12 sm:h-16 w-2/3 max-w-xl rounded-xl" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-24" />
    </div>

    <div className="max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] space-y-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-3.5 w-full" />
        </div>
      ))}
    </div>
  </div>
);

/** Matches the edit forms (fields + buttons). */
export const FormSkeleton = () => (
  <div
    className="min-h-screen bg-white px-6 sm:px-6 lg:px-6 xl:px-6 2xl:px-6 pb-4 pt-10 box-border"
    aria-hidden="true"
  >
    <div className="mb-8 space-y-3">
      <Skeleton className="h-12 sm:h-16 w-1/2 max-w-md rounded-xl" />
      <Skeleton className="h-4 w-56" />
    </div>

    <div className="max-w-3xl">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

/** Matches CardComponent used on the admin dashboard. */
export const StatCardSkeleton = () => (
  <div
    className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.02)] space-y-3"
    aria-hidden="true"
  >
    <Skeleton className="h-2.5 w-20" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

export default Skeleton;
