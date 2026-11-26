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
    className="bg-white border rounded-2xl overflow-hidden w-full h-full flex flex-col"
    style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    aria-hidden="true"
  >
    <div className="h-1/2 border-b" style={{ borderColor: "var(--color-border-primary)" }}>
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
    className="w-full bg-white border rounded-xl py-3.5 px-4 flex items-center justify-between gap-4"
    style={{ borderColor: "var(--color-border-primary)" }}
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
    className="w-full bg-white border rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
    style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
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
  <div className="space-y-6 max-w-4xl mx-auto w-full" aria-hidden="true">
    <div className="space-y-4">
      <Skeleton className="h-10 sm:h-12 w-2/3 max-w-xl rounded-xl" />
      <Skeleton className="h-4 w-48" />
    </div>

    <div
      className="bg-white border rounded-2xl p-6 sm:p-8 space-y-5"
      style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    >
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
  <div className="space-y-6 max-w-4xl mx-auto w-full" aria-hidden="true">
    <div className="space-y-3">
      <Skeleton className="h-10 sm:h-12 w-1/2 max-w-md rounded-xl" />
      <Skeleton className="h-4 w-56" />
    </div>

    <div>
      <div
        className="bg-white border rounded-2xl p-6 sm:p-8"
        style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
      >
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
    className="bg-white border rounded-2xl p-5 space-y-3 h-full"
    style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    aria-hidden="true"
  >
    <Skeleton className="h-2.5 w-20" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

export default Skeleton;
