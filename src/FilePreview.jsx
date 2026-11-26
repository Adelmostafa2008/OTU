import { useEffect, useRef, useState } from "react";
import DocxPreview from "./DocxPreview";
import { downloadFile, fetchStoredFile, getFileExt } from "./detailUtils";
import {
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
  FiVideo,
} from "react-icons/fi";

// Preview for files attached to lessons, quizzes, assignments and meetings.
// It mirrors the lesson content viewer: one large preview with a download
// button and a strip of thumbnails to move between files.

const isImageExt = (ext) =>
  ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "avif", "ico"].includes(ext);
const isVideoExt = (ext) =>
  ["mp4", "webm", "ogg", "mov", "mkv", "avi"].includes(ext);
const isPdfExt = (ext) => ext === "pdf";
const isTxtExt = (ext) =>
  ["txt", "log", "md", "csv", "json", "xml", "yaml", "yml"].includes(ext);
// Only the OOXML .docx format can be rendered; the legacy binary .doc format
// (and other Office formats) cannot be parsed in the browser.
const isDocxExt = (ext) => ext === "docx";
const isOfficeExt = (ext) =>
  ["doc", "xls", "xlsx", "ppt", "pptx", "odt", "ods", "odp", "rtf"].includes(ext);

const typeMeta = (ext) => {
  if (isImageExt(ext)) return { label: "IMAGE", Icon: FiImage };
  if (isVideoExt(ext)) return { label: "VIDEO", Icon: FiVideo };
  if (isPdfExt(ext)) return { label: "PDF", Icon: FiFileText };
  if (isTxtExt(ext)) return { label: "TXT", Icon: FiFileText };
  if (isDocxExt(ext) || ext === "doc")
    return { label: ext.toUpperCase() || "DOC", Icon: FiFileText };
  return { label: (ext || "FILE").toUpperCase(), Icon: FiFile };
};

const fileNameFromUrl = (url, fallback) => {
  try {
    const last = new URL(url, window.location.origin).pathname.split("/").pop();
    if (last) return decodeURIComponent(last.split("?")[0]) || fallback;
  } catch {
    // ignore unparsable URLs
  }
  return fallback;
};

const FileTypeTile = ({ ext, size = "md" }) => {
  const { label, Icon } = typeMeta(ext);
  const box = size === "lg" ? "h-16 w-16" : "h-10 w-10";
  const icon = size === "lg" ? 28 : 18;
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <span
        className={`flex ${box} items-center justify-center rounded-xl`}
        style={{ backgroundColor: "#F1F6E4", color: "#91b141" }}
      >
        <Icon size={icon} />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </span>
    </div>
  );
};

const PreviewMessage = ({ title, message }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
    <FileTypeTile ext="" size="lg" />
    <div>
      <p className="m-0 text-sm font-semibold text-gray-900">{title}</p>
      <p className="m-0 mt-1 text-sm text-gray-500">{message}</p>
    </div>
  </div>
);

const PreviewBody = ({ file, guest = false }) => {
  const ext = getFileExt(file);
  const needsFetch = isTxtExt(ext) || isPdfExt(ext) || isDocxExt(ext);
  // The component is keyed by file, so the initial status can be the final
  // one: previews that need the bytes start in the loading phase.
  const [state, setState] = useState(() => ({
    status: needsFetch && file.url ? "loading" : "idle",
    text: "",
    blob: null,
    objectUrl: "",
  }));

  useEffect(() => {
    if (!file.url || !needsFetch) return undefined;

    let cancelled = false;
    let createdUrl = "";

    fetchStoredFile(file.url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (isTxtExt(ext)) {
          const text = await response.text();
          if (!cancelled) setState({ status: "ready", text, blob: null, objectUrl: "" });
          return;
        }
        const blob = await response.blob();
        createdUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(createdUrl);
          return;
        }
        setState({ status: "ready", text: "", blob, objectUrl: createdUrl });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", text: "", blob: null, objectUrl: "" });
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [file.url, ext, needsFetch]);

  if (!file.url) {
    return (
      <PreviewMessage
        title="Preview not available"
        message="This attachment has no stored content to preview."
      />
    );
  }

  if (isImageExt(ext)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white p-4">
        <img
          src={file.url}
          alt={file.name}
          className="max-h-full w-auto max-w-full rounded-lg object-contain"
        />
      </div>
    );
  }

  if (isVideoExt(ext)) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <video
          src={file.url}
          controls
          className="h-full w-full object-contain"
          preload="metadata"
        />
      </div>
    );
  }

  if (isPdfExt(ext)) {
    // The fetched blob keeps the viewer inline even when the storage answers
    // with `Content-Disposition: attachment`; the direct URL is the fallback.
    const src = state.objectUrl || file.url;
    const suffix = `${state.objectUrl ? "" : "#view=FitH"}${
      guest ? `${state.objectUrl ? "#" : "&"}toolbar=0&navpanes=0` : ""
    }`;
    return (
      <div className="relative h-full w-full bg-white">
        <iframe
          src={`${src}${suffix}`}
          title={file.name}
          className="h-full w-full border-0 bg-white"
        />
        {state.status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85">
            <span className="text-xs font-semibold text-gray-500">Loading preview…</span>
          </div>
        )}
      </div>
    );
  }

  if (isTxtExt(ext)) {
    if (state.status === "loading") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-white">
          <span className="text-xs font-semibold text-gray-500">Loading preview…</span>
        </div>
      );
    }
    if (state.status === "error") {
      return (
        <PreviewMessage
          title="Preview not available"
          message="This text file could not be loaded. Download it to view its contents."
        />
      );
    }
    return (
      <pre className="m-0 h-full w-full overflow-auto whitespace-pre-wrap break-words bg-white p-5 text-left font-mono text-sm leading-relaxed text-gray-800">
        {state.text || "This file is empty."}
      </pre>
    );
  }

  if (isDocxExt(ext)) {
    if (state.blob) {
      return <DocxPreview blob={state.blob} className="h-full w-full" />;
    }
    if (state.status === "error") {
      return (
        <PreviewMessage
          title="Preview not available"
          message="This Word document could not be loaded. Download it to view its contents."
        />
      );
    }
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <span className="text-xs font-semibold text-gray-500">Loading preview…</span>
      </div>
    );
  }

  if (isOfficeExt(ext)) {
    return (
      <PreviewMessage
        title="Preview not available"
        message="Office files cannot be previewed in the browser. Download this file to view it."
      />
    );
  }

  return (
    <PreviewMessage
      title="Preview not available"
      message="This file type can be downloaded to view."
    />
  );
};

const resolveUrl = (url) => {
  const t = String(url ?? "").trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  if (lower === "null" || lower === "undefined") return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(t) || t.startsWith("//")) return t;
  if (t.startsWith("/samples")) return t;
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (base && t.startsWith("/")) return `${base}${t}`;
  return t;
};

const FilePreview = ({ documents = [], guest = false, onBlocked }) => {
  const [index, setIndex] = useState(0);
  const stripRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const files = documents.map((doc, i) => {
    const rawUrl = doc.url || doc.Url || doc.URL || doc.href || "";
    const url = resolveUrl(rawUrl);
    const name = doc.name || doc.filename || doc.fileName || fileNameFromUrl(url || rawUrl, `File ${i + 1}`);
    return {
      ...doc,
      name,
      url,
      type: doc.type || doc.content_type || doc.contentType || getFileExt({ name, url, type: doc.type }),
    };
  });

  const checkScroll = () => {
    const el = stripRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(checkScroll) : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      if (ro) ro.disconnect();
    };
  }, [files.length]);

  const scrollStrip = (direction) => {
    stripRef.current?.scrollBy({ left: direction * 220, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  if (files.length === 0) return null;

  const safeIndex = Math.min(index, files.length - 1);
  const selected = files[safeIndex];
  const selectedExt = getFileExt(selected);
  const { label, Icon } = typeMeta(selectedExt);

  const handleDownload = () => {
    if (!selected.url) return;
    if (guest) {
      onBlocked?.();
      return;
    }
    void downloadFile(selected.url, selected.name);
  };

  return (
    <div className="w-full space-y-3">
      <article
        className="flex w-full flex-col overflow-hidden rounded-xl border bg-white"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div
          className="flex flex-shrink-0 items-center justify-between gap-3 border-b bg-gray-50 px-4 py-3 sm:px-5"
          style={{ borderColor: "#E5E7EB" }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-wide"
              style={{ borderColor: "#DCE7C8", backgroundColor: "#F1F6E4", color: "#91b141" }}
            >
              <Icon size={12} />
              {label}
            </span>
            <span
              className="min-w-0 truncate text-sm font-semibold text-gray-900 sm:text-base"
              title={selected.name}
            >
              {selected.name}
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-[#F1F6E4] sm:text-sm"
            style={{ borderColor: "#D1D5DB" }}
            aria-label={`Download ${selected.name}`}
          >
            <FiDownload size={14} />
            Download
          </button>
        </div>
        <div className="h-[38vh] min-h-[280px] w-full">
          <PreviewBody
            key={selected.url || selected.name}
            file={selected}
            guest={guest}
          />
        </div>
      </article>

      {files.length > 1 && (
        <div className="relative w-full">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollStrip(-1)}
              className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-700 shadow-sm sm:flex"
              style={{ borderColor: "#D1D5DB" }}
              aria-label="Previous files"
            >
              <FiChevronLeft size={16} />
            </button>
          )}

          <div
            ref={stripRef}
            className={`flex gap-3 overflow-x-auto scroll-smooth pb-1 [&::-webkit-scrollbar]:hidden ${
              canScrollLeft || canScrollRight ? "px-10" : "px-1"
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {files.map((file, i) => {
              const fileExt = getFileExt(file);
              const active = i === safeIndex;
              const previewableImage = file.url && isImageExt(fileExt);
              return (
                <button
                  key={`${file.name}-${i}`}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border p-0 text-left ${
                    active ? "ring-2 ring-offset-2" : ""
                  }`}
                  style={{
                    borderColor: active ? "#91b141" : "#E5E7EB",
                    boxShadow: active ? "0 0 0 1px #DCE7C8" : "none",
                    cursor: "pointer",
                  }}
                  aria-label={`Preview ${file.name}`}
                  aria-pressed={active}
                  title={file.name}
                >
                  {previewableImage ? (
                    <img src={file.url} alt="" className="block h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-white">
                      <FileTypeTile ext={fileExt} />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-[#7c9b36] px-2 py-1">
                    <span className="block truncate text-[10px] font-medium text-white">
                      {file.name}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollStrip(1)}
              className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-700 shadow-sm sm:flex"
              style={{ borderColor: "#D1D5DB" }}
              aria-label="Next files"
            >
              <FiChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilePreview;
