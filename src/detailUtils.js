// Shared helpers for the detail pages.

const resolveUrl = (url) => {
  const t = String(url ?? "").trim();
  if (!t) return "";
  const lower = t.toLowerCase();
  if (lower === "null" || lower === "undefined") return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(t) || t.startsWith("//")) return t;
  // Frontend-served sample assets must stay relative.
  if (t.startsWith("/samples")) return t;
  // Anything else that is server-relative is resolved against the API base so
  // the preview does not accidentally load the SPA (which renders the home page).
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (base && t.startsWith("/")) return `${base}${t}`;
  return t;
};

const pickUrl = (value) => {
  if (typeof value === "string") return resolveUrl(value);
  if (Array.isArray(value)) return pickUrl(value[0]);
  if (value && typeof value === "object") {
    return pickUrl(
      value.url ??
        value.Url ??
        value.URL ??
        value.href ??
        value.Href ??
        value.path ??
        value.Path ??
        value.fileUrl ??
        value.FileUrl ??
        value.fileURL ??
        value.FileURL ??
        value.location ??
        value.Location ??
        value.link ??
        value.Link ??
        value.key ??
        value.Key,
    );
  }
  return "";
};

// A document descriptor may carry a storage `key` (an object name such as
// "otu-hub/Faculty/file.pdf") next to its signed URL. That key is not a URL and
// must never be used as one, otherwise every preview 404s against the SPA.
const URL_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/)/i;

const pickDescriptorUrl = (doc) => {
  if (typeof doc === "string") {
    const value = pickUrl(doc);
    return value && URL_RE.test(value) ? value : "";
  }
  if (!doc || typeof doc !== "object") return "";
  const candidates = [
    doc.downloadUrl,
    doc.DownloadUrl,
    doc.downloadURL,
    doc.downloadurl,
    doc.fileUrl,
    doc.FileUrl,
    doc.fileURL,
    doc.FileURL,
    doc.fileurl,
    doc.contentUrl,
    doc.ContentUrl,
    doc.contentURL,
    doc.contenturl,
    doc.signedUrl,
    doc.SignedUrl,
    doc.signedURL,
    doc.signedurl,
    doc.storageUrl,
    doc.StorageUrl,
    doc.presignedUrl,
    doc.PresignedUrl,
    doc.documentUrl,
    doc.DocumentUrl,
    doc.url,
    doc.Url,
    doc.URL,
    doc.href,
    doc.Href,
    doc.location,
    doc.Location,
    doc.link,
    doc.Link,
  ];
  for (const candidate of candidates) {
    const value = pickUrl(candidate);
    if (value && URL_RE.test(value)) return value;
  }
  // Endpoints do not agree on the name of the url property (`fileurl`,
  // `signedurl`, `storageurl`...), so any remaining key that looks like a url
  // is accepted rather than leaving the attachment without a source.
  for (const key of Object.keys(doc)) {
    if (!normalizeFieldKey(key).includes("url")) continue;
    const value = pickUrl(doc[key]);
    if (value && URL_RE.test(value)) return value;
  }
  return "";
};

const decodeName = (name) => {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const nameFromUrl = (url, fallback) => {
  const clean = String(url || "").split("?")[0].split("#")[0];
  const last = clean.split("/").pop();
  if (last) return decodeName(last);
  return fallback;
};

const pickText = (source, keys) => {
  if (!source || typeof source !== "object") return "";
  for (const key of Object.keys(source)) {
    if (!keys.includes(normalizeFieldKey(key))) continue;
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
};

// Descriptors use inconsistent casing for their own fields (`filename` /
// `Filename`, `content_type` / `ContentType`), so both are read through the
// normalised key lookup. The extension is kept on the name for display and for
// the preview type detection.
const docName = (doc, url, index) => {
  const raw =
    pickText(doc, ["filename", "name"]) || nameFromUrl(url, `file-${index + 1}`);
  const name = decodeName(String(raw || `file-${index + 1}`).trim());
  return name || `file-${index + 1}`;
};

const docType = (doc, name) => {
  const declared = pickText(doc, ["contenttype", "type", "mimetype", "mime"]);
  const type = declared || name.split(".").pop() || "";
  return String(type).toLowerCase().trim();
};

// Documents can arrive in several shapes:
//  - descriptor objects already carrying a url (guest sample data)
//  - a list of descriptor objects (`files`/`docs`/`UploadFiles`) paired with a
//    parallel list of storage URLs (`filesurls`/`fileUrls`)
//  - a bare list of storage URLs
// Normalise all of them to `{ name, url, type }` so the preview can render.
// Some endpoints serialise their lists as JSON strings instead of arrays.
const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

export const getDetailDocuments = (data) => {
  if (!data || typeof data !== "object") return [];

  // Guests get named documents that already carry a usable url.
  const namedRaw = getListField(data, ["documents"]);
  const named = Array.isArray(namedRaw) ? namedRaw : [];
  if (named.length > 0 && named.some((doc) => pickDescriptorUrl(doc))) {
    return named
      .map((doc, i) => {
        const url = pickDescriptorUrl(doc);
        const name = docName(doc, url, i);
        return { ...doc, name, url, type: docType(doc, name) };
      })
      .filter((d) => d.name || d.url);
  }

  // Field names are not consistent between endpoints (`files`/`Files`, `docs`,
  // `filesurls`/`filesUrls`/`fileUrls`), so they are matched case-insensitively
  // and with punctuation stripped.
  const docsRaw = getListField(data, [
    "files",
    "file",
    "docs",
    "uploadfiles",
    "documents",
    "attachments",
  ]);
  // A single attachment can arrive as one descriptor object instead of a list.
  const isDescriptor = (value) =>
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) =>
      ["filename", "name", "key", "contenttype", "mimetype", "url", "fileurl"].includes(
        normalizeFieldKey(key),
      ),
    );
  const docsArr = Array.isArray(docsRaw)
    ? docsRaw
    : isDescriptor(docsRaw)
      ? [docsRaw]
      : docsRaw && typeof docsRaw === "object"
        ? Object.values(docsRaw).flat()
        : [];

  const toUrl = (item) => {
    const value = pickUrl(item);
    return value && URL_RE.test(value) ? value : "";
  };
  // Keep the positions of a URL list: a null/empty slot belongs to the document
  // at the same index, and filtering those out would shift every later URL.
  const toUrlList = (raw) => {
    const list = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object"
        ? Object.values(raw)
        : raw
          ? [raw]
          : [];
    return list.map(toUrl);
  };

  const URL_LIST_KEYS = [
    "filesurls",
    "fileurls",
    "filesurl",
    "fileurl",
    "urls",
    "documenturls",
    "documenturl",
    "downloadurls",
    "signedurls",
    "contenturls",
    "attachmenturls",
    "uploadfilesurls",
    "filesurlslist",
  ];
  const urlsRaw = getListField(data, URL_LIST_KEYS);
  let urls = toUrlList(urlsRaw);

  // Quiz and assignment payloads do not always reuse the lesson field names
  // (`FilesUrls`/`files_urls`/`SignedFileUrls`/`Urls`). When no known list was
  // found, any other top-level list of urls is accepted, preferring the one
  // that lines up one-to-one with the descriptors.
  if (!urls.some(Boolean)) {
    const candidates = Object.keys(data)
      .filter((key) => normalizeFieldKey(key).includes("url"))
      .filter((key) => !URL_LIST_KEYS.includes(normalizeFieldKey(key)))
      .map((key) => toUrlList(parseMaybeJson(data[key])))
      .filter((list) => list.some(Boolean));
    const exact = candidates.find((list) => list.length === docsArr.length);
    const byCount = candidates.find(
      (list) => list.filter(Boolean).length === docsArr.length,
    );
    urls = exact || byCount || candidates[0] || [];
  }
  const usableUrls = urls.filter(Boolean);
  // Some endpoints only ship a single `previewurl`/`preveiwurl` for the item
  // instead of a per-file URL list.
  const previewUrl = toUrl(
    getContentField(data, ["previewurl", "preveiwurl", "previewuri", "preveiwuri"]),
  );

  if (docsArr.length > 0) {
    const urlFor = (i) => {
      if (urls.length === docsArr.length) return urls[i] || "";
      if (usableUrls.length === docsArr.length) return usableUrls[i] || "";
      if (urls[i]) return urls[i];
      return docsArr.length === 1 ? usableUrls[0] || "" : "";
    };

    return docsArr
      .map((doc, i) => {
        // The download URLs paired with the descriptors are authoritative: in
        // quiz/assignment payloads a descriptor's own `url` can be the presigned
        // upload URL returned when the file was added, which cannot be fetched
        // for preview. The lesson endpoint omits it, so this ordering keeps the
        // lesson page working while fixing the other two.
        const url =
          urlFor(i) ||
          pickDescriptorUrl(doc) ||
          (docsArr.length === 1 ? previewUrl : "");
        const name = docName(doc, url, i);
        const type = docType(doc, name);
        if (!name && !url) return null;
        return { name, url, type };
      })
      .filter(Boolean);
  }

  if (usableUrls.length > 0) {
    return usableUrls.map((url, i) => {
      const name = nameFromUrl(url, `file-${i + 1}`);
      return { name, url, type: (name.split(".").pop() || "").toLowerCase() };
    });
  }

  // Fall back to named documents even if they had no url (they will render a
  // "Preview not available" tile instead of disappearing).
  if (named.length > 0) {
    return named
      .map((doc, i) => {
        const url = pickDescriptorUrl(doc);
        const name = docName(doc, url, i);
        return { ...doc, name, url, type: docType(doc, name) };
      })
      .filter((d) => d.name || d.url);
  }

  return [];
};

// Content fields (`link`/`text`) arrive with inconsistent casing and spelling
// between endpoints, so keys are compared after stripping non-letters.
const normalizeFieldKey = (key) => String(key).toLowerCase().replace(/[^a-z]/g, "");

export const getContentField = (item, keys) => {
  if (!item || typeof item !== "object") return undefined;
  const match = Object.keys(item).find((key) => keys.includes(normalizeFieldKey(key)));
  return match === undefined ? undefined : item[match];
};

// A payload may carry several spellings/casings of the same field. When one of
// them is an empty list (e.g. `files: []`) it must not hide the populated one.
const getListField = (item, keys) => {
  if (!item || typeof item !== "object") return undefined;
  const values = Object.keys(item)
    .filter((key) => keys.includes(normalizeFieldKey(key)))
    .map((key) => parseMaybeJson(item[key]))
    .filter((value) => value !== null && value !== undefined && value !== "");
  if (values.length === 0) return undefined;
  const populatedArray = values.find(
    (value) => Array.isArray(value) && value.length > 0,
  );
  if (populatedArray) return populatedArray;
  const populatedObject = values.find(
    (value) => value && typeof value === "object" && Object.keys(value).length > 0,
  );
  if (populatedObject) return populatedObject;
  return values[0];
};

export const hasFieldValue = (value) =>
  value !== null && value !== undefined && String(value).trim() !== "";

export const toExternalUrl = (value) => {
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

// A file's extension can come from its name, from its URL (the name may be a
// descriptor without an extension) or from its declared MIME type.
const EXT_BY_MIME = {
  "application/pdf": "pdf",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/bmp": "bmp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogg",
  "video/quicktime": "mov",
};

const extFromPath = (value) => {
  const clean = String(value || "").split("?")[0].split("#")[0];
  const last = clean.split("/").pop() || "";
  const decoded = (() => {
    try {
      return decodeURIComponent(last);
    } catch {
      return last;
    }
  })();
  const idx = decoded.lastIndexOf(".");
  if (idx < 0) return "";
  return decoded.slice(idx + 1).toLowerCase();
};

export const getFileExt = (file) => {
  if (!file) return "";
  const fromName = extFromPath(file.name || file.filename || "");
  if (fromName) return fromName;
  const fromUrl = extFromPath(file.url || "");
  if (fromUrl) return fromUrl;
  const declared = String(file.type || file.mime || file.content_type || file.contentType || "")
    .toLowerCase()
    .split(";")[0]
    .trim();
  if (EXT_BY_MIME[declared]) return EXT_BY_MIME[declared];
  if (/^[a-z0-9]{1,8}$/.test(declared)) return declared;
  return "";
};

// Storage URLs are presigned and served from a different origin. The browser
// blocks them when they are requested with credentials (the storage answers
// `Access-Control-Allow-Credentials: ""`, which is invalid for an `include`
// request), so every direct request is made without credentials.
export const fetchStoredFile = (url) =>
  fetch(url, { credentials: "omit", mode: "cors", cache: "no-store" });

// Downloads go through a blob so the `download` file name is honoured even for
// cross-origin storage URLs (the anchor's `download` attribute is ignored when
// the URL is on another origin). If the file cannot be fetched, the browser
// opens the storage URL instead of doing nothing.
export const downloadFile = async (url, name) => {
  const fallback = () => {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = name || "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!url) return;
  try {
    const response = await fetchStoredFile(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = name || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
  } catch {
    fallback();
  }
};

// Date helpers shared by the detail pages.

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDetailDate = (value) => {
  const date = toDate(value);
  if (!date) return null;
  const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return { weekday, month, day, year, time };
};

// mode: "due" for deadlines and exams, "start" for meetings, "uploaded" for
// past dates that should not be framed as a countdown at all.
export const getCountdown = (value, mode = "due") => {
  const date = toDate(value);
  if (!date || mode === "uploaded") return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target - today) / 86400000);

  if (days < 0) {
    const overdue = Math.abs(days);
    return {
      label:
        mode === "start"
          ? `${overdue} day${overdue === 1 ? "" : "s"} ago`
          : `Overdue by ${overdue} day${overdue === 1 ? "" : "s"}`,
      tone: mode === "start" ? "slate" : "rose",
    };
  }
  if (days === 0) {
    return {
      label: mode === "start" ? "Starts today" : "Due today",
      tone: "amber",
    };
  }
  return {
    label:
      mode === "start"
        ? `Starts in ${days} day${days === 1 ? "" : "s"}`
        : `${days} day${days === 1 ? "" : "s"} left`,
    tone: days <= 3 ? "amber" : "emerald",
  };
};
