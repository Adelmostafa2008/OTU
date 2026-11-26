import { formatDetailDate, hasFieldValue, toExternalUrl } from "./detailUtils";
import FilePreview from "./FilePreview";
import {
  FiCalendar,
  FiExternalLink,
  FiFileText,
  FiInfo,
  FiLink,
  FiPaperclip,
  FiZap,
} from "react-icons/fi";

// Shared visual language for the four content detail pages.
//
// White surfaces with a single solid olive accent: no gradients, no translucent
// tints, no decorative chrome. A lesson, a quiz, an assignment and an online
// meeting all read like the same product: a title block with who it comes from
// and when, a strip of metadata, the body content, attachments and notes.

const OLIVE = "#91b141";
const OLIVE_DARK = "#7c9b36";
const OLIVE_SOFT = "#F1F6E4";
const OLIVE_LINE = "#DCE7C8";
const LINE = "#E5E7EB";

const COUNTDOWN_STYLES = {
  emerald: { background: OLIVE_SOFT, borderColor: OLIVE_LINE, color: OLIVE_DARK },
  amber: { background: OLIVE, borderColor: OLIVE, color: "#FFFFFF" },
  rose: { background: "#FFFFFF", borderColor: "#FCA5A5", color: "#B42318" },
  slate: { background: "#FFFFFF", borderColor: "#D1D5DB", color: "#4B5563" },
};

const GuestBanner = ({ message }) => (
  <div
    className="flex items-start gap-3 rounded-xl border bg-white px-4 py-3 text-left"
    style={{ borderColor: LINE }}
  >
    <span className="mt-0.5 flex-shrink-0" style={{ color: OLIVE }}>
      <FiInfo size={16} />
    </span>
    <p className="m-0 text-[13px] leading-relaxed text-gray-600">
      <span className="font-bold text-gray-800">Guest preview. </span>
      {message ||
        "You are viewing sample content. Editing, deleting and downloading are disabled for guest accounts."}
    </p>
  </div>
);

export const SectionHeading = ({ icon: Icon, title, count }) => (
  <div className="flex items-center gap-2.5">
    {Icon ? <Icon size={14} className="flex-shrink-0 text-gray-400" /> : null}
    <h2 className="m-0 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">
      {title}
      {typeof count === "number" ? ` (${count})` : ""}
    </h2>
    <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
  </div>
);

const DetailShell = ({
  kind = "Content",
  KindIcon = FiFileText,
  title,
  uploader,
  date,
  dateLabel = "Date",
  showTime = true,
  countdown = null,
  meta = [],
  badge = null,
  actions = null,
  guest = false,
  guestMessage,
  documents = [],
  link = null,
  linkLabel = "Shared link",
  text = null,
  textLabel = "Content",
  afterDocuments = null,
  onGuestAction,
  onGuestDownload,
  notes = null,
  notesTitle = "Notes",
  children,
}) => {
  const formattedDate = formatDetailDate(date);
  const hasLink = hasFieldValue(link);
  const hasText = hasFieldValue(text);
  const linkUrl = hasLink ? toExternalUrl(link) : "";
  const countdownStyle =
    COUNTDOWN_STYLES[countdown?.tone] || COUNTDOWN_STYLES.slate;
  const hasNotes =
    notes !== null && notes !== undefined && String(notes).trim() !== "";

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {guest && <GuestBanner message={guestMessage} />}

      <article
        className="w-full overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: LINE, boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)" }}
      >
        <header className="px-5 pb-6 pt-7 sm:px-8 sm:pb-7 sm:pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
              style={{ background: OLIVE }}
            >
              <KindIcon size={11} />
              {kind}
            </span>
            {badge && (
              <span className="inline-flex items-center rounded-md border border-gray-300 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600">
                {badge}
              </span>
            )}
          </div>

          <h1 className="m-0 mt-4 text-2xl font-extrabold leading-[1.2] tracking-tight text-gray-900 break-words text-left sm:text-3xl lg:text-[2rem]">
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            {uploader && (
              <div className="flex items-center gap-2.5">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                  style={{ background: OLIVE }}
                  aria-hidden="true"
                >
                  {String(uploader).charAt(0).toUpperCase()}
                </span>
                <span className="flex flex-col leading-tight text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Uploaded by
                  </span>
                  <span className="mt-0.5 text-sm font-bold text-gray-900">
                    {uploader}
                  </span>
                </span>
              </div>
            )}
            {formattedDate && (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
                <FiCalendar size={14} className="text-gray-400" />
                <span className="font-medium">{dateLabel}</span>
                <span className="text-gray-400">·</span>
                <span>
                  {formattedDate.weekday}, {formattedDate.day} {formattedDate.month}{" "}
                  {formattedDate.year}
                  {showTime && formattedDate.time ? ` at ${formattedDate.time}` : ""}
                </span>
              </span>
            )}
            {countdown && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold"
                style={countdownStyle}
              >
                <FiZap size={11} />
                {countdown.label}
              </span>
            )}
          </div>

          {actions && (
            <div className="mt-6 flex flex-wrap items-center gap-2.5">{actions}</div>
          )}
        </header>

        {meta.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-y px-5 py-3 sm:px-8"
            style={{ borderColor: LINE }}
          >
            {meta.map((item) => (
              <p key={item.label} className="m-0 text-[13px] text-gray-600">
                <span className="font-semibold text-gray-400">{item.label}: </span>
                <span className="font-medium text-gray-800 break-words">
                  {item.value}
                </span>
              </p>
            ))}
          </div>
        )}
        <div className="space-y-7 px-5 py-7 sm:px-8 sm:py-8">
          {children}

          {hasLink && (
            <section className="space-y-3">
              <SectionHeading icon={FiLink} title={linkLabel} />
              <a
                href={linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-2 text-sm sm:text-base font-semibold text-[#91b141] hover:text-[#7c9b36] underline decoration-[#DCE7C8] underline-offset-4 break-all"
              >
                <span className="break-all">{String(link).trim()}</span>
                <FiExternalLink size={15} className="mt-1 flex-shrink-0" aria-hidden="true" />
              </a>
            </section>
          )}

          {hasText && (
            <section className="space-y-3">
              <SectionHeading icon={FiFileText} title={textLabel} />
              <p className="m-0 text-sm sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-left">
                {String(text).trim()}
              </p>
            </section>
          )}

          {documents.length > 0 && (
            <section className="space-y-3">
              <SectionHeading
                icon={FiPaperclip}
                title="Attached files"
                count={documents.length}
              />
              <FilePreview
                documents={documents}
                guest={guest}
                onBlocked={onGuestDownload || onGuestAction}
              />
            </section>
          )}

          {afterDocuments}

          {hasNotes && (
            <section className="space-y-3">
              <SectionHeading icon={FiFileText} title={notesTitle} />
              <p className="m-0 text-sm sm:text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words text-left">
                {String(notes)}
              </p>
            </section>
          )}
        </div>
      </article>
    </div>
  );
};

export default DetailShell;
