export const CONTENT_TYPES = ["link", "text", "documents"];
// Online meetings never support documents, only a link or text content.
export const MEETING_CONTENT_TYPES = ["link", "text"];
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_FILE_SIZE_LABEL = "50MB";

export const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export const getFilesTotalSize = (files) =>
  (Array.isArray(files) ? files : []).reduce((sum, file) => {
    const size = file instanceof File ? file.size : Number(file?.size ?? 0);
    return sum + (Number.isFinite(size) ? size : 0);
  }, 0);

export const isSavedDoc = (file) =>
  !!file && !(file instanceof File) && (file.key !== undefined || file.filename !== undefined);

// Responses do not keep one casing for the same field: a payload can arrive as
// `faculty`/`Faculty`, `uploadContentType`/`UploadContentType` or `type`/`Type`.
// Look every incoming name up case-insensitively so a differently cased
// response never leaves a required field blank. Null/undefined are skipped so
// an explicitly null key does not mask a populated one.
export const pickField = (source, ...names) => {
  if (!source || typeof source !== "object") return undefined;
  const wanted = names.map((name) => name.toLowerCase());
  let fallback;
  for (const key of Object.keys(source)) {
    if (!wanted.includes(key.toLowerCase())) continue;
    const value = source[key];
    if (value === null || value === undefined) continue;
    if (names.includes(key)) return value;
    if (fallback === undefined) fallback = value;
  }
  return fallback;
};

// A saved document descriptor is [filename, size, content_type]; the storage
// `key` is optional because some endpoints omit it entirely.
export const toSavedDoc = (doc) => {
  if (!doc || typeof doc !== "object") return null;
  const filename = doc.filename ?? doc.fileName ?? doc.name ?? "";
  if (!String(filename).trim()) return null;
  return {
    filename: String(filename),
    size: Number(doc.size ?? 0) || 0,
    content_type: String(
      doc.content_type ?? doc.contentType ?? "application/octet-stream",
    ),
    key: String(doc.key ?? doc.Key ?? ""),
  };
};

// `files` is normally an array of descriptors, but a single descriptor or a
// keyed object of descriptors is accepted too so no attachment is dropped.
export const toSavedDocs = (files) => {
  if (Array.isArray(files)) return files.map(toSavedDoc).filter(Boolean);
  if (!files || typeof files !== "object") return [];
  if (files.filename || files.fileName || files.name) {
    const single = toSavedDoc(files);
    return single ? [single] : [];
  }
  return Object.values(files)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map(toSavedDoc)
    .filter(Boolean);
};

const toText = (value) => String(value ?? "").trim();

// Nullable fields are always present in the payload; an empty value is sent as
// null so the API receives the full shape it accepts.
const toNullable = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }
  return value;
};

const toDocDescriptor = (file) => {
  if (!file) return null;
  const isFile = typeof File !== "undefined" && file instanceof File;
  const filename = isFile ? file.name : file.filename ?? file.name ?? "";
  const size = isFile ? file.size : Number(file.size ?? 0);
  const contentType = isFile
    ? file.type || "application/octet-stream"
    : file.content_type ?? file.contentType ?? "application/octet-stream";

  return {
    filename: String(filename),
    size: Number.isFinite(size) ? size : 0,
    content_type: String(contentType),
  };
};

export const buildDocs = (files) =>
  (Array.isArray(files) ? files : []).map(toDocDescriptor).filter(Boolean);

export const normalizeContentType = (value, { allowDocuments = true } = {}) => {
  const declared = String(value ?? "").trim().toLowerCase();
  if (!allowDocuments) return declared === "text" ? "text" : "link";
  if (CONTENT_TYPES.includes(declared)) return declared;
  return declared === "text" ? "text" : "link";
};

// Builds the exact body the API accepts for every content tab:
// Faculty, Division, Subject, Year, semester, Title and the tab's date prop are
// required; Notes, userid, UploadLink, UploadText, docs, Type and
// UploadContentType are nullable and are sent as null when they do not apply.
// `dateField` is the tab's own date property (QuizDate, OnlineMeetingDate,
// deadline); it is never renamed. `includeType` is only true for lessons.
export const buildContentPayload = (
  data = {},
  { dateField, allowDocuments = true, includeType = false } = {},
) => {
  const contentType = normalizeContentType(data.UploadContentType, { allowDocuments });
  const files = Array.isArray(data.UploadFiles) ? data.UploadFiles : [];

  const payload = {
    faculty: toText(data.faculty),
    division: toText(data.division),
    subject: toText(data.subject),
    year: toText(data.year),
    semester: toText(data.semester),
    notes: toNullable(data.notes ?? data.description),
    title: toText(data.title),
    userid: toNullable(data.userid ?? data.userId ?? data.UploaderId),
    UploadLink: contentType === "link" ? toText(data.UploadLink ?? data.link) : null,
    UploadText: contentType === "text" ? toText(data.UploadText ?? data.text) : null,
    docs:
      allowDocuments && contentType === "documents" ? buildDocs(files) : null,
    type: includeType ? toNullable(data.type ?? data.Type) : null,
    UploadContentType: contentType,
  };

  if (dateField) payload[dateField] = toNullable(data[dateField]);

  return payload;
};
