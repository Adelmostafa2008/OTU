import React from "react";
import { FiArchive, FiFile, FiFileText, FiLink, FiMusic, FiVideo } from "react-icons/fi";

const VIDEO_PREVIEW_EXTS = ["mp4", "mov", "webm", "mkv", "avi", "ogg", "wmv"];
const ARCHIVE_PREVIEW_EXTS = ["zip", "rar", "7z", "tar", "gz", "bz2", "iso"];
const AUDIO_PREVIEW_EXTS = ["mp3", "wav", "aac", "flac", "m4a"];

const getFileNameFromUrl = (value) => {
  if (typeof value !== "string" || !value) return "";
  let pathname;
  try {
    pathname = new URL(value).pathname;
  } catch {
    pathname = value.split("?")[0].split("#")[0];
  }
  let base = pathname.split("/").filter(Boolean).pop() || "";
  try {
    base = decodeURIComponent(base);
  } catch {
    // keep the raw name when it is not valid percent-encoding
  }
  return base;
};

const getPreviewIcon = (label) => {
  const key = String(label || "").trim().toLowerCase();
  if (VIDEO_PREVIEW_EXTS.includes(key)) return FiVideo;
  if (ARCHIVE_PREVIEW_EXTS.includes(key)) return FiArchive;
  if (AUDIO_PREVIEW_EXTS.includes(key)) return FiMusic;
  if (key) return FiFileText;
  return FiFile;
};

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
  previewStatus = "none",
  previewKind = "file",
  previewLabel = "",
  previewSource = "",
}) => {
  const displayDescription =
    description === null || description === undefined ? "" : description;
  const normalizedType = type == null ? "" : String(type).trim();
  const typeBlobClass = getLessonTypeStyle(normalizedType);
  const previewTypeLabel = previewLabel ? String(previewLabel).toUpperCase() : "FILE";
  const PreviewIcon = getPreviewIcon(previewLabel);
  const hasImage = typeof image === "string" && image.trim() !== "";
  const previewFileName = getFileNameFromUrl(previewSource);
  const effectivePreviewStatus =
    previewStatus === "image" && !hasImage ? "unavailable" : previewStatus;
  const placeholder = (() => {
    if (previewKind === "link") {
      return {
        Icon: FiLink,
        title: "Link content",
        message: "Open this lesson to view the link.",
      };
    }
    if (previewKind === "text") {
      return {
        Icon: FiFileText,
        title: "Text paragraph",
        message: "Open this lesson to read the text content.",
      };
    }
    if (previewKind === "empty") {
      return {
        Icon: FiFile,
        title: "No preview",
        message: "No document is attached to this lesson.",
      };
    }
    return {
      Icon: PreviewIcon,
      title: `${previewTypeLabel} file`,
      message: "Preview not available for this file type.",
    };
  })();

  return (
    <article
      className="bg-white border rounded-2xl w-full h-full flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="relative flex-shrink-0 h-1/2 overflow-hidden"
        style={{ borderBottom: "1px solid var(--color-border-primary)" }}
      >
        {effectivePreviewStatus === "image" ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        ) : effectivePreviewStatus === "loading" ? (
          <div className="w-full h-full bg-gray-100 animate-pulse" aria-hidden="true" />
        ) : effectivePreviewStatus === "unavailable" ||
          effectivePreviewStatus === "content" ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2 px-4 text-center bg-gradient-to-br from-slate-100 via-white to-indigo-50"
            title={previewSource || undefined}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm">
              <placeholder.Icon size={20} aria-hidden="true" />
            </span>
            <div className="flex flex-col items-center gap-0.5 min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-700 text-center">
                {placeholder.title}
              </span>
              <span className="text-[11px] text-gray-500 max-w-[220px] break-words">
                {placeholder.message}
              </span>
              {previewFileName && (
                <span className="text-[10px] text-gray-400 max-w-[220px] truncate w-full">
                  {previewFileName}
                </span>
              )}
            </div>
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover block"
            loading="lazy"
          />
        )}
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
