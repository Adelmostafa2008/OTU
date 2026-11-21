import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { DetailPageSkeleton } from "./Skeleton";
import {
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
  FiVideo,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiLink,
} from "react-icons/fi";
import axios from "axios";

const s3Client = axios.create();

const normalizeFieldKey = (key) => String(key).toLowerCase().replace(/[^a-z]/g, "");

// The API sends filesurls, link and text side by side, with only one of them
// populated, and the key casing/spelling is not consistent between responses.
const getLessonField = (item, keys) => {
  if (!item || typeof item !== "object") return undefined;
  const match = Object.keys(item).find((key) => keys.includes(normalizeFieldKey(key)));
  return match === undefined ? undefined : item[match];
};

const hasFieldValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

const toExternalUrl = (value) => {
  let candidate = value;
  if (Array.isArray(candidate)) candidate = candidate[0];
  if (candidate && typeof candidate === "object") {
    candidate =
      candidate.url ?? candidate.Url ?? candidate.URL ?? candidate.href ?? candidate.link ?? "";
  }
  const raw = String(candidate ?? "").trim();
  if (!raw) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw;
  if (raw.startsWith("//")) return `https:${raw}`;
  return `https://${raw}`;
};

const getUserId = (user) =>
  user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";

const getIsCreator = (item) => {
  const flag =
    item?.iscreator ?? item?.isCreator ?? item?.IsCreator ?? item?.Iscreator;
  return flag === true || flag === 1 || flag === "true";
};

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof err?.plainMessage === "string" && err.plainMessage.trim())
    return err.plainMessage.trim();
  if (typeof err?.message === "string" && err.message.trim()) return err.message.trim();
  if (data && typeof data === "object") {
    const direct = data.message ?? data.error ?? data.msg ?? data.title ?? data.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
    if (data.errors && typeof data.errors === "object") {
      const first = Object.values(data.errors).flat().find((item) => item);
      if (first) return String(first);
    }
  }
  if (err?.code === "ERR_NETWORK" || (!err?.response && err?.request)) {
    return "Network error. Please check your connection and try again.";
  }
  return fallback;
};

const getSuccessMessage = (res, fallback) => {
  const data = res?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof res?.plainMessage === "string" && res.plainMessage.trim())
    return res.plainMessage.trim();
  if (typeof res?.message === "string" && res.message.trim()) return res.message.trim();
  if (data && typeof data === "object") {
    const direct = data.message ?? data.msg ?? data.title ?? data.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();
  }
  return fallback;
};

const getUploaderDisplayName = (item) => {
  const fullName = item?.uploadername ?? item?.uplodername ?? item?.uploaderName;
  if (typeof fullName !== "string") return null;
  const parts = fullName.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return null;
  return parts.slice(0, 2).join(" ");
};

// Strip everything up to and including the last hyphen so a name like
// "11-21-12-35-49-side features otu.hub.txt" becomes "side features otu.hub.txt".
const displayName = (name) => {
  if (!name) return "file";
  const idx = name.lastIndexOf("-");
  if (idx < 0) return name;
  const part = name.slice(idx + 1).trim();
  return part || name;
};

const getExt = (name) => {
  if (!name) return "";
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx + 1).toLowerCase();
};

const isImageExt = (ext) =>
  ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext);
const isVideoExt = (ext) =>
  ["mp4", "webm", "ogg", "mov", "mkv", "avi"].includes(ext);
const isPdfExt = (ext) => ext === "pdf";
const isTxtExt = (ext) => ext === "txt";
const isDocxExt = (ext) => ext === "docx" || ext === "doc";

const fetchFilesFromUrls = async (urls) => {
  if (!Array.isArray(urls)) return [];
  const normalized = urls
    .map((u) => (typeof u === "string" ? u : u?.url || u?.Url || u?.URL))
    .filter(Boolean);
  const results = await Promise.all(
    normalized.map(async (url) => {
      try {
        const res = await s3Client.get(url, { responseType: "blob" });
        const blob = res.data;
        let filename = "file";
        try {
          const urlObj = new URL(url);
          const last = urlObj.pathname.split("/").pop();
          if (last) filename = decodeURIComponent(last.split("?")[0]) || filename;
        } catch {
          // ignore URL parsing errors
        }
        const cd =
          res.headers?.["content-disposition"] ||
          res.headers?.["Content-Disposition"];
        if (cd) {
          const match = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
          if (match && match[1]) {
            try {
              filename = decodeURIComponent(match[1]);
            } catch {
              filename = match[1];
            }
          }
        }
        const type = blob.type || "application/octet-stream";
        return new File([blob], filename, { type, lastModified: Date.now() });
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
};

const typeMeta = (ext) => {
  if (isImageExt(ext))
    return {
      label: "IMAGE",
      badge: "bg-sky-100 text-sky-700 border-sky-200",
      Icon: FiImage,
      accent: "from-sky-50 to-white",
    };
  if (isVideoExt(ext))
    return {
      label: "VIDEO",
      badge: "bg-violet-100 text-violet-700 border-violet-200",
      Icon: FiVideo,
      accent: "from-violet-50 to-white",
    };
  if (isPdfExt(ext))
    return {
      label: "PDF",
      badge: "bg-red-100 text-red-700 border-red-200",
      Icon: FiFileText,
      accent: "from-red-50 to-white",
    };
  if (isTxtExt(ext))
    return {
      label: "TXT",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      Icon: FiFileText,
      accent: "from-amber-50 to-white",
    };
  if (isDocxExt(ext))
    return {
      label: ext.toUpperCase(),
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      Icon: FiFileText,
      accent: "from-blue-50 to-white",
    };
  return {
    label: (ext || "FILE").toUpperCase(),
    badge: "bg-gray-100 text-gray-700 border-gray-200",
    Icon: FiFile,
    accent: "from-gray-50 to-white",
  };
};

const MainFilePreview = ({ file, url }) => {
  const [text, setText] = useState("");
  const ext = getExt(file.name);
  const name = displayName(file.name);
  const meta = typeMeta(ext);

  useEffect(() => {
    if (!isTxtExt(ext)) return;
    let cancelled = false;
    file
      .text()
      .then((t) => {
        if (!cancelled) setText(t);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [file, ext]);

  const renderBody = () => {
    if (isImageExt(ext)) { // test the browse section in upload page and handel the slow get or upload documents freebuff --continue 2026-11-20T21-31-13.101Z
      return (
        <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2ff)] p-4">
          <img
            src={url}
            alt={name}
            className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-sm"
          />
        </div>
      );
    }
    if (isVideoExt(ext)) {
      return (
        <div className="w-full h-full bg-black flex items-center justify-center">
          <video
            src={url}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          />
        </div>
      );
    }
    if (isPdfExt(ext)) {
      return (
        <iframe
          src={url}
          title={name}
          className="w-full h-full border-0 bg-white"
        />
      );
    }
    if (isTxtExt(ext)) {
      return (
        <pre className="m-0 w-full h-full p-4 sm:p-5 text-sm text-gray-800 whitespace-pre-wrap break-words font-mono overflow-auto bg-white text-left leading-relaxed">
          {text || "Loading text…"}
        </pre>
      );
    }
    if (isDocxExt(ext)) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
            <FiFileText size={26} />
          </div>
          <div>
            <p className="m-0 text-base font-semibold text-gray-900">
              Word document
            </p>
            <p className="m-0 mt-1 text-sm text-gray-500 max-w-md">
              Inline DOCX preview needs a library like <code>docx-preview</code>.
              Download to view the full document.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center shadow-inner">
          <FiFile size={26} />
        </div>
        <div>
          <p className="m-0 text-base font-semibold text-gray-900">
            Preview not available
          </p>
          <p className="m-0 mt-1 text-sm text-gray-500">
            This file type can be downloaded to view.
          </p>
        </div>
      </div>
    );
  };

  return (
    <article
      className="w-full rounded-2xl border bg-white overflow-hidden flex flex-col shadow-sm"
      style={{
        borderColor: "var(--color-border-primary)",
        height: "40vh",
        minHeight: "320px",
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex-shrink-0"
        style={{ borderColor: "var(--color-border-primary)" }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold tracking-wide flex-shrink-0 ${meta.badge}`}
          >
            <meta.Icon size={12} />
            {meta.label}
          </span>
          <span
            className="text-sm sm:text-base font-semibold text-gray-900 truncate min-w-0"
            title={name}
          >
            {name}
          </span>
        </div>
        <a
          href={url}
          download={file.name}
          className="inline-flex items-center gap-2 rounded-lg border bg-white text-gray-800 font-semibold text-xs sm:text-sm px-3 py-1.5 flex-shrink-0"
          style={{ borderColor: "var(--color-border-primary)" }}
          aria-label={`Download ${name}`}
        >
          <FiDownload size={14} />
          Download
        </a>
      </div>
      <div className="flex-1 min-h-0 w-full">{renderBody()}</div>
    </article>
  );
};

const StripThumb = ({ file, url, selected, onSelect }) => {
  const ext = getExt(file.name);
  const name = displayName(file.name);
  const meta = typeMeta(ext);
  const { Icon } = meta;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex-shrink-0 w-28 sm:w-32 h-20 sm:h-24 rounded-xl border overflow-hidden text-left cursor-pointer p-0 ${
        selected ? "ring-2 ring-offset-2" : ""
      }`}
      style={{
        borderColor: selected ? "var(--color-brand-primary, #4f46e5)" : "var(--color-border-primary)",
        boxShadow: selected ? "0 0 0 1px rgba(79,70,229,0.15)" : "none",
      }}
      aria-label={`Select ${name}`}
      aria-pressed={selected}
      title={name}
    >
      {isImageExt(ext) ? (
        <img src={url} alt="" className="w-full h-full object-cover block" />
      ) : isVideoExt(ext) ? (
        <div className="relative w-full h-full bg-gray-900">
          <video
            src={url}
            className="w-full h-full object-cover block"
            muted
            preload="metadata"
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-7 w-7 rounded-full bg-black/55 text-white flex items-center justify-center">
              <FiVideo size={14} />
            </span>
          </span>
        </div>
      ) : (
        <div
          className={`w-full h-full flex flex-col items-center justify-center gap-1.5 px-2 bg-gradient-to-br ${meta.accent}`}
        >
          <span
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${meta.badge}`}
          >
            <Icon size={16} />
          </span>
          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
            {meta.label}
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-1.5 pb-1 pt-4">
        <span className="block text-[10px] font-medium text-white truncate">
          {name}
        </span>
      </div>
    </button>
  );
};

const LessonDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [lesson, setLesson] = useState(null);
  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const stripRef = useRef(null);
  const urlsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [fetchingFiles, setFetchingFiles] = useState(false);

  const checkStripScroll = useCallback(() => {
    const el = stripRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
  }, []);

  const scrollStrip = (direction) => {
    const el = stripRef.current;
    if (!el) return;
    const amount = Math.max(180, Math.round(el.clientWidth * 0.7));
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let cancelled = false;
    const fetchLesson = async () => {
      setLoading(true);
      try {
        const userId = getUserId(user);
        const response = await api.get(`student/lesson/${id}?userid=${userId}`);
        if (cancelled) return;
        const data = response?.data || null;
        setLesson(data);
        const urls = getLessonField(data, ["filesurls", "fileurls"]) || [];
        if (Array.isArray(urls) && urls.length > 0) {
          setFetchingFiles(true);
          const fetched = await fetchFilesFromUrls(urls);
          if (cancelled) return;
          urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
          urlsRef.current = [];
          const next = fetched.map((file) => {
            const url = URL.createObjectURL(file);
            urlsRef.current.push(url);
            return { file, url };
          });
          setFilePreviews(next);
          setSelectedIndex(0);
        } else {
          urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
          urlsRef.current = [];
          setFilePreviews([]);
          setSelectedIndex(0);
        }
      } catch (err) {
        if (!cancelled) {
          setLesson(null);
          ShowSnackBar(getErrorMessage(err, "Failed to load lesson."), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFetchingFiles(false);
        }
      }
    };
    fetchLesson();
    return () => {
      cancelled = true;
    };
  }, [id, user, ShowSnackBar]);

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    checkStripScroll();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkStripScroll);
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => checkStripScroll())
        : null;
    if (ro) ro.observe(el);
    window.addEventListener("resize", checkStripScroll);
    return () => {
      el.removeEventListener("scroll", checkStripScroll);
      window.removeEventListener("resize", checkStripScroll);
      if (ro) ro.disconnect();
    };
  }, [checkStripScroll, filePreviews.length]);

  const handleDelete = async () => {
    if (isGuest) return;
    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirmed) return;
    try {
      const res = await api.delete(`/Upload/${id}`);
      ShowSnackBar(getSuccessMessage(res, "Deleted successfully."), "success");
      navigate("/");
    } catch (err) {
      ShowSnackBar(getErrorMessage(err, "Failed to delete."), "error");
    }
  };

  const handleEdit = () => {
    navigate(`/lesson/${id}/edit`, { state: { lesson } });
  };

  if (loading) {
    return <DetailPageSkeleton />;
  }

  const data = lesson;
  if (!data) {
    return (
      <div className="max-w-3xl mx-auto">
        <div
          className="bg-white border rounded-2xl px-6 py-10 text-sm text-gray-500 text-center"
          style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
        >
          Lesson not found.
        </div>
      </div>
    );
  }

  const title = data.title || data.name || "Untitled Lesson";
  const notes = data.notes ?? null;
  const lessonLink = getLessonField(data, ["link", "lessonlink", "uploadlink", "contentlink"]);
  const lessonText = getLessonField(data, ["text", "lessontext", "uploadtext", "contenttext"]);
  const hasLink = hasFieldValue(lessonLink);
  const hasText = hasFieldValue(lessonText);
  const contentMode = hasLink ? "link" : hasText ? "text" : "files";
  const lessonLinkUrl = hasLink ? toExternalUrl(lessonLink) : "";

  const handleOpenLessonLink = (event) => {
    event.preventDefault();
    if (!lessonLinkUrl) return;
    window.open(lessonLinkUrl, "_blank", "noopener,noreferrer");
  };
  const uploaderDisplayName = getUploaderDisplayName(data);
  const isCreator = getIsCreator(data);
  const safeSelectedIndex =
    filePreviews.length === 0 ? 0 : Math.min(selectedIndex, filePreviews.length - 1);
  const selected = filePreviews[safeSelectedIndex] || null;

  return (
    <div className="max-w-3xl mx-auto w-full">
      {isCreator && (
        <div className="flex justify-end gap-2 mb-3">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-xl border bg-white text-gray-900 font-semibold text-sm cursor-pointer px-3.5 py-2.5 shadow-sm"
            style={{ borderColor: "var(--color-border-primary)" }}
            aria-label="Edit lesson"
          >
            <FiEdit2 size={16} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isGuest}
            className={`flex items-center gap-2 rounded-xl border border-red-300 bg-white text-red-600 font-semibold text-sm cursor-pointer px-3.5 py-2.5 shadow-sm ${
              isGuest ? "opacity-60 pointer-events-none" : ""
            }`}
            aria-label="Delete lesson"
          >
            <FiTrash2 size={16} />
            Delete
          </button>
        </div>
      )}

      <div
        className="bg-white border rounded-3xl p-6 sm:p-8 space-y-8 text-left w-full"
        style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
      >
        <header className="space-y-3">
          {uploaderDisplayName && (
            <div className="flex items-center gap-3 text-left">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-extrabold shadow-sm ring-2 ring-white"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-brand-primary, #4f46e5), #7c3aed)",
                }}
                aria-hidden="true"
              >
                {uploaderDisplayName.charAt(0).toUpperCase()}
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Uploaded by
                </span>
                <span className="text-base sm:text-lg font-extrabold text-gray-900">
                  {uploaderDisplayName}
                </span>
              </div>
            </div>
          )}

          <h1 className="m-0 text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight break-words text-left">
            {title}
          </h1>

          {contentMode === "files" && filePreviews.length > 0 && (
            <p className="m-0 text-sm text-gray-500">
              {filePreviews.length} {filePreviews.length === 1 ? "file" : "files"} attached
            </p>
          )}
        </header>

        <section className="space-y-4 w-full">
          {contentMode === "link" ? (
            <div
              className="w-full h-auto rounded-2xl border p-5 sm:p-6 bg-gradient-to-br from-sky-50 via-white to-indigo-50/40"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-700 border border-sky-200 flex-shrink-0 shadow-sm">
                  <FiLink size={20} />
                </span>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
                    Lesson Link
                  </p>
                  <a
                    href={lessonLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOpenLessonLink}
                    className="group inline-flex items-center gap-2 text-base sm:text-lg font-semibold text-sky-700 hover:text-sky-800 underline decoration-sky-300 underline-offset-4 break-all cursor-pointer"
                  >
                    <span className="break-all">{String(lessonLink).trim()}</span>
                    <FiExternalLink size={16} className="flex-shrink-0" aria-hidden="true" />
                  </a>
                  <p className="m-0 text-sm text-gray-500">
                    Click the link to open it in a new tab.
                  </p>
                </div>
              </div>
            </div>
          ) : contentMode === "text" ? (
            <div
              className="w-full h-auto rounded-2xl border p-5 sm:p-6 bg-gradient-to-br from-amber-50/60 via-white to-white"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex-shrink-0 shadow-sm">
                  <FiFileText size={20} />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-amber-700">
                    Lesson Content
                  </p>
                  <p className="m-0 text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap break-words text-left">
                    {String(lessonText).trim()}
                  </p>
                </div>
              </div>
            </div>
          ) : fetchingFiles ? (
            <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
              Preparing file previews…
            </div>
          ) : selected ? (
            <div className="w-full space-y-3">
              <MainFilePreview file={selected.file} url={selected.url} />

              {filePreviews.length > 1 && (
                <div className="relative w-full">
                  {canScrollLeft && (
                    <button
                      type="button"
                      onClick={() => scrollStrip("left")}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 cursor-pointer"
                      style={{ borderColor: "var(--color-border-primary)" }}
                      aria-label="Scroll files left"
                    >
                      <FiChevronLeft size={18} />
                    </button>
                  )}

                  <div
                    ref={stripRef}
                    className="flex gap-3 overflow-x-auto scroll-smooth pb-1 px-1 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {filePreviews.map((item, idx) => (
                      <StripThumb
                        key={`${item.file.name}-${idx}`}
                        file={item.file}
                        url={item.url}
                        selected={idx === safeSelectedIndex}
                        onSelect={() => setSelectedIndex(idx)}
                      />
                    ))}
                  </div>

                  {canScrollRight && (
                    <button
                      type="button"
                      onClick={() => scrollStrip("right")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border bg-white/95 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-700 cursor-pointer"
                      style={{ borderColor: "var(--color-border-primary)" }}
                      aria-label="Scroll files right"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
              No files available for this lesson.
            </div>
          )}
        </section>

        {notes !== null && notes !== undefined && String(notes).trim() !== "" && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <h2 className="m-0 text-xs font-bold text-gray-500 uppercase tracking-[0.16em]">
                Notes
              </h2>
              <span className="h-px flex-1 bg-gray-200" aria-hidden="true" />
            </div>
            <div className="rounded-2xl bg-gray-50/80 border border-gray-200/80 p-4 sm:p-5">
              <p className="m-0 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words w-full text-left">
                {notes}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LessonDetailsPage;
