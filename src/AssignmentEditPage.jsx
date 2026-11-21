import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FormSkeleton } from "./Skeleton";
import axios from "axios";

const s3Client = axios.create();

const SUBJECTS = [
  "Math",
  "Physics",
  "Technical english",
  "Programming",
  "IT essintials",
];

const FACULTIES = [
  "Faculty of Industry and Energy Technology",
  "Faculty of Applied Health Science Technology",
];

const DIVISIONS_BY_FACULTY = {
  "Faculty of Industry and Energy Technology": [
    "IT",
    "Spinning and weaving technology",
    "Food Manufacturing Technology",
    "Railway Technology",
  ],
  "Faculty of Applied Health Science Technology": [
    "Medical Device Technology",
    "Prosthetics and Orthotics Technology",
  ],
};

const YEARS = ["1", "2", "3", "4"];
const SEMESTERS = ["first", "second"];

const CONTENT_TYPES = ["link", "text", "documents"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "50MB";
const OPTIONAL_FIELDS = ["notes", "description", "UploadLink", "UploadText"];

const normalizeContentData = (data = {}) => {
  const rawDocs = Array.isArray(data.docs)
    ? data.docs
    : Array.isArray(data.UploadFiles)
      ? data.UploadFiles
      : null;
  const declared = String(data.UploadContentType || "").trim().toLowerCase();
  // UploadContentType holds the selected tab, but older records may hold a MIME
  // type or nothing, so fall back to the docs/text/link content.
  const type = CONTENT_TYPES.includes(declared)
    ? declared
    : rawDocs && rawDocs.length > 0
      ? "documents"
      : data.UploadText || data.text
        ? "text"
        : "link";

  return {
    ...data,
    UploadContentType: type,
    UploadLink: type === "link" ? (data.UploadLink ?? data.link ?? "") : null,
    UploadText: type === "text" ? (data.UploadText ?? data.text ?? "") : null,
    UploadFiles: type === "documents" ? rawDocs : null,
  };
};

const preparePayload = (data) => {
  const payload = {};
  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      payload[key] = value;
      return;
    }
    if (typeof value !== "string") {
      payload[key] = value;
      return;
    }
    const cleaned = value.trim();
    if (cleaned === "" && OPTIONAL_FIELDS.includes(key)) return;
    payload[key] = cleaned;
  });
  return payload;
};

// Files are never sent to the API. Only a light descriptor is sent (the actual
// bytes go to the cloud storage separately), matching the server `docs` DTO.
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

const buildDocs = (files) =>
  (Array.isArray(files) ? files : []).map(toDocDescriptor).filter(Boolean);

const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFilesTotalSize = (files) =>
  (Array.isArray(files) ? files : []).reduce((sum, file) => {
    const size = file instanceof File ? file.size : Number(file?.size ?? 0);
    return sum + (Number.isFinite(size) ? size : 0);
  }, 0);

// Builds the plain JSON body the API expects. Only the properties of the
// selected content tab get a value; the rest are sent as null.
const buildSubmissionData = (data, { allowDocuments = true } = {}) => {
  const { UploadFiles, ...rest } = data;
  const payload = preparePayload(rest);

  const type = !allowDocuments
    ? data.UploadContentType === "text"
      ? "text"
      : "link"
    : data.UploadContentType || "link";

  const docs = allowDocuments && type === "documents" ? buildDocs(UploadFiles) : null;

  payload.UploadLink = type === "link" ? String(data.UploadLink ?? "").trim() : null;
  payload.UploadText = type === "text" ? String(data.UploadText ?? "").trim() : null;

  // UploadContentType names the selected tab: "link", "text" or "documents".
  payload.UploadContentType = type;

  if (allowDocuments) {
    payload.docs = docs;
  } else {
    delete payload.docs;
    delete payload.UploadFiles;
  }

  return payload;
};

// After the API saves the record it answers with one presigned URL per file.
// The bytes are then put straight into the cloud storage, exactly like the
// lesson tab does it. Non-file entries (already saved descriptors) are skipped.
const uploadDocsToStorage = async (response, files) => {
  if (!Array.isArray(response?.data)) return;
  const list = Array.isArray(files) ? files : [];

  await Promise.all(
    response.data.map(async (item, index) => {
      const file = list[index];
      if (!file || !(file instanceof File)) return;

      await s3Client.put(item.url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
    }),
  );
};

const AssignmentEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!location.state?.assignment);

  const [formData, setFormData] = useState(normalizeContentData(location.state?.assignment || {}));
  const [initialData, setInitialData] = useState(normalizeContentData(location.state?.assignment || {}));
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user.role !== "admin" && user.role !== "instructor") {
      navigate("/", { replace: true });
      return;
    }

    const fetchData = async () => {
      setFetching(true);
      try {
        let response;
        try {
          const userId = user?.id || user?.userId || user?._id || "";
          response = await api.get(`/assignment/single/${id}?user_id=${userId}`);
        } catch (e) {
          try {
            response = await api.get(`/assignment/${id}`);
          } catch (e2) {
            response = null;
          }
        }
        if (response?.data) {
          const normalized = normalizeContentData(response.data);
          setFormData(normalized);
          setInitialData(normalized);
        } else {
          const empty = normalizeContentData({});
          setFormData(empty);
          setInitialData(empty);
        }
      } catch (err) {
        const empty = normalizeContentData({});
        setFormData(empty);
        setInitialData(empty);
      } finally {
        setFetching(false);
      }
    };

    if (!location.state?.assignment) {
      fetchData();
    } else {
      const normalized = normalizeContentData(location.state?.assignment || {});
      setFormData(normalized);
      setInitialData(normalized);
    }
  }, [user, navigate, id, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "title" && typeof value === "string") {
      nextValue = value.slice(0, 100);
    } else if (name === "notes" && typeof value === "string") {
      nextValue = value.slice(0, 400);
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === "faculty") {
        next.division = "";
      }
      return next;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) return;
    if (!formData.title?.trim()) {
      ShowSnackBar("Title is required.", "warn");
      return;
    }
    if (String(formData.title).length > 100) {
      ShowSnackBar("Title must be at most 100 characters.", "warn");
      return;
    }
    const notesVal = formData.notes || formData.description || "";
    if (notesVal && String(notesVal).length > 400) {
      ShowSnackBar("Notes must be at most 400 characters.", "warn");
      return;
    }
    const contentType = formData.UploadContentType || "link";
    if (contentType === "link" && !String(formData.UploadLink || "").trim()) {
      ShowSnackBar("Please provide a link.", "warn");
      return;
    }
    if (contentType === "text" && !String(formData.UploadText || "").trim()) {
      ShowSnackBar("Please provide text content.", "warn");
      return;
    }
    if (contentType === "documents" && (!Array.isArray(formData.UploadFiles) || formData.UploadFiles.length === 0)) {
      ShowSnackBar("Please select at least one document.", "warn");
      return;
    }
    if (contentType === "documents") {
      const docsTotalSize = getFilesTotalSize(formData.UploadFiles);
      if (docsTotalSize > MAX_FILE_SIZE) {
        ShowSnackBar(`Total file size cannot exceed ${MAX_FILE_SIZE_LABEL} per upload.`, "warn");
        return;
      }
    }

    const dateVal = getMeetingDateValue();
    if (dateVal) {
      const selectedDate = new Date(dateVal);
      if (!isNaN(selectedDate.getTime())) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        if (selectedDate < todayStart) {
          ShowSnackBar("Please select today or a future date and time for the assignment.", "warn");
          return;
        }
      }
    }

    setLoading(true);
    try {
      const submission = buildSubmissionData(formData);
      if (dateVal) {
        submission.OnlineMeetingDate = dateVal;
        submission.assignmentDate = dateVal;
        submission.date = dateVal;
      }
      const response = await api.put(`/assignment/${id}`, submission, {
        withCredentials: true,
      });
      await uploadDocsToStorage(response, formData.UploadFiles);
      ShowSnackBar("Assignment updated successfully.", "success");
      navigate(`/assignment/${id}`, { state: { assignment: { ...formData, ...(dateVal ? { OnlineMeetingDate: dateVal } : {}) } } });
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ?? err?.response?.data?.error ?? null;
      ShowSnackBar(serverMsg || "Failed to update assignment.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== "admin" && user.role !== "instructor")) {
    return null;
  }

  if (fetching) {
    return <FormSkeleton />;
  }

  const inputClass =
    "w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";
  const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
  const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
  const fieldStyle = { borderColor: "var(--color-border-primary)" };

  const renderSubjects = (id, value) => (
    <select disabled={isGuest} id={id} name="subject" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select subject</option>
      {SUBJECTS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderFaculties = (id, value) => (
    <select disabled={isGuest} id={id} name="faculty" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select faculty</option>
      {FACULTIES.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderDivisions = (id, faculty, value) => {
    const options = DIVISIONS_BY_FACULTY[faculty] || [];
    return (
      <select disabled={isGuest}
        id={id}
        name="division"
        value={value || ""}
        onChange={handleChange}
        className={selectClass}
        style={fieldStyle}
        disabled={options.length === 0}
        required
      >
        <option value="">
          {options.length === 0 ? "Select faculty first" : "Select division"}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  };

  const renderYears = (id, value) => (
    <select disabled={isGuest} id={id} name="year" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderSemesters = (id, value) => (
    <select disabled={isGuest} id={id} name="semester" value={value || ""} onChange={handleChange} className={selectClass} style={fieldStyle} required>
      <option value="">Select semester</option>
      {SEMESTERS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
  const getMeetingDateValue = () => {
    const raw = formData.deadline || formData.Deadline || formData.OnlineMeetingDate || formData.assignmentDate || formData.meetingDate || formData.date || "";
    if (!raw) return "";

    const toDateTimeLocal = (date) => {
      if (!(date instanceof Date) || isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    if (raw instanceof Date) return toDateTimeLocal(raw);

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return "";
      if (/(Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) {
        return toDateTimeLocal(new Date(trimmed));
      }
      let s = trimmed.replace(" ", "T");
      if (s.includes(".")) s = s.split(".")[0];
      if (s.match(/T\d{2}:\d{2}:\d{2}/)) {
        s = s.replace(/(T\d{2}:\d{2}):\d{2}/, "$1");
      } else if (s.match(/T\d{2}:\d{2}$/)) {
      } else if (s.match(/T\d{2}$/)) {
        s = s + ":00";
      } else if (!s.includes("T") && /^\d{4}-\d{2}-\d{2}$/.test(s)) {
        return `${s}T00:00`;
      }
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
      return toDateTimeLocal(new Date(trimmed));
    }

    try {
      return toDateTimeLocal(new Date(raw));
    } catch {
      return "";
    }
  };

  const meetingDateValue = getMeetingDateValue();

  const setContentType = (type) => {
    setFormData((prev) => ({
      ...prev,
      UploadContentType: type,
      UploadLink: type === "link" ? (prev.UploadLink ?? "") : null,
      UploadText: type === "text" ? (prev.UploadText ?? "") : null,
      UploadFiles: type === "documents" ? (prev.UploadFiles ?? null) : null,
    }));
  };

  const handleFileSelection = (e, { append = false } = {}) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (selected.length === 0) return;

    setFormData((prev) => {
      const currentFiles = Array.isArray(prev.UploadFiles) ? prev.UploadFiles : [];
      const baseFiles = append ? currentFiles : [];
      const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
      if (oversized) {
        ShowSnackBar(
          `"${oversized.name}" is ${formatFileSize(oversized.size)}, which is over the ${MAX_FILE_SIZE_LABEL} limit. Please choose a smaller file.`,
          "warn",
        );
        return prev;
      }
      const nextFiles = [...baseFiles, ...selected];
      const totalSize = getFilesTotalSize(nextFiles);
      if (totalSize > MAX_FILE_SIZE) {
        ShowSnackBar(
          `Total file size cannot exceed ${MAX_FILE_SIZE_LABEL} per upload.`,
          "warn",
        );
        return prev;
      }
      return { ...prev, UploadFiles: nextFiles, UploadContentType: "documents" };
    });
  };

  const handleRemoveFile = (index) => {
    setFormData((prev) => {
      const currentFiles = Array.isArray(prev.UploadFiles) ? prev.UploadFiles : [];
      const nextFiles = currentFiles.filter((_, i) => i !== index);
      return { ...prev, UploadFiles: nextFiles.length > 0 ? nextFiles : null };
    });
  };

  const handleAddMoreFiles = (files, disabled) => {
    if (disabled) return;
    if (getFilesTotalSize(files) >= MAX_FILE_SIZE) {
      ShowSnackBar("Size cannot exceed the maximum size of upload per time.", "warn");
      return;
    }
    document.getElementById(`assignment-upload-files-add`)?.click();
  };

  const renderContentSection = () => {
    const type = formData.UploadContentType || "link";
    const tabBase = "px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors";
    const activeStyle = { backgroundColor: "var(--color-brand-primary)", color: "#ffffff", borderColor: "var(--color-brand-primary)" };
    const inactiveStyle = { borderColor: "var(--color-border-primary)", color: "var(--color-text-primary, #111827)", backgroundColor: "#ffffff" };
    const files = Array.isArray(formData.UploadFiles) ? formData.UploadFiles : [];
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((option) => {
            const active = type === option;
            const label = option === "link" ? "Link" : option === "text" ? "Text" : "Documents";
            return (
              <button key={option} type="button" onClick={() => setContentType(option)} className={`${tabBase} cursor-pointer`} style={active ? activeStyle : inactiveStyle}>
                {label}
              </button>
            );
          })}
        </div>
        {type === "link" && (
          <div>
            <label htmlFor="assignment-upload-link" className={labelClass}>Link <span className="text-red-500">*</span></label>
            <input id="assignment-upload-link" name="UploadLink" type="url" disabled={isGuest} readOnly={isGuest} value={formData.UploadLink || ""} onChange={(e) => setFormData((prev) => ({ ...prev, UploadLink: e.target.value }))} placeholder="https://example.com/resource" className={inputClass} style={fieldStyle} required={!isGuest} />
          </div>
        )}
        {type === "text" && (
          <div>
            <label htmlFor="assignment-upload-text" className={labelClass}>Text <span className="text-red-500">*</span></label>
            <textarea id="assignment-upload-text" name="UploadText" disabled={isGuest} readOnly={isGuest} value={formData.UploadText || ""} onChange={(e) => setFormData((prev) => ({ ...prev, UploadText: e.target.value }))} placeholder="Enter text content..." rows={6} className={`${inputClass} resize-none overflow-y-auto`} style={{ ...fieldStyle, minHeight: "160px" }} required={!isGuest} />
          </div>
        )}
        {type === "documents" && (
          <div>
            <label className={labelClass}>
              Documents <span className="text-red-500">*</span>
            </label>
            <div
              className="w-full rounded-2xl border-2 border-dashed p-5 sm:p-6 flex flex-col items-stretch text-center bg-gray-50/60"
              style={{ borderColor: "var(--color-border-primary)" }}
            >
              <div className="flex flex-col items-center justify-center">
                <input id={`assignment-upload-files`} type="file" multiple className="hidden" disabled={isGuest} onChange={(e) => handleFileSelection(e)} />
                <input id={`assignment-upload-files-add`} type="file" multiple className="hidden" disabled={isGuest} onChange={(e) => handleFileSelection(e, { append: true })} />
                {files.length === 0 && (
                  <>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "rgba(0,0,0,0.04)", color: "var(--color-brand-primary)" }} aria-hidden="true">
                    <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 16V4" /><path d="M7 9l5-5 5 5" /><path d="M4 20h16" />
                    </svg>
                  </div>
                  <button type="button" disabled={isGuest} onClick={(e) => { if (isGuest) { e.preventDefault(); e.stopPropagation(); return; } document.getElementById(`assignment-upload-files`)?.click(); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${isGuest ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`} style={{ backgroundColor: "var(--color-brand-primary)" }}>Browse</button>
                  <p className="m-0 mt-2 text-xs text-gray-500">Maximum total size {MAX_FILE_SIZE_LABEL}</p>
                  </>
                )}
              </div>

              {files.length > 0 && (() => {
                const totalSize = getFilesTotalSize(files);
                const atLimit = totalSize >= MAX_FILE_SIZE;
                return (
                  <div className="w-full text-left rounded-2xl border bg-white p-4 sm:p-5" style={{ borderColor: "var(--color-border-primary)" }}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {files.length} file{files.length > 1 ? "s" : ""} selected
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600">
                        Total: <span className={totalSize > MAX_FILE_SIZE ? "text-red-600 font-semibold" : "text-gray-900 font-semibold"}>{formatFileSize(totalSize)}</span>
                        <span className="text-gray-400"> / {MAX_FILE_SIZE_LABEL}</span>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map((file, idx) => {
                          const name = file.name || file.filename || "file";
                          const size = file instanceof File ? file.size : Number(file.size ?? 0);
                          return (
                            <div key={`${name}-${idx}-${size}`} className="flex items-start gap-3 rounded-xl border bg-gray-50/70 p-3 sm:p-3.5 min-w-0" style={{ borderColor: "var(--color-border-primary)" }} title={name}>
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white border text-gray-600 shadow-sm" style={{ borderColor: "var(--color-border-primary)" }} aria-hidden="true">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="m-0 text-sm font-semibold text-gray-900 leading-snug break-words line-clamp-3">{name}</p>
                                <p className="m-0 mt-1 text-xs text-gray-500">{formatFileSize(size)}</p>
                              </div>
                              <button type="button" disabled={isGuest} onClick={() => handleRemoveFile(idx)} className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border bg-white text-gray-500 transition-colors ${isGuest ? "opacity-50 cursor-not-allowed" : "hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer"}`} style={{ borderColor: "var(--color-border-primary)" }} aria-label={`Remove ${name}`} title="Remove file">
                                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-center sm:justify-end">
                      <button type="button" onClick={() => handleAddMoreFiles(files, isGuest)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${isGuest ? "cursor-not-allowed" : "cursor-pointer"} ${atLimit ? "opacity-50" : "hover:bg-gray-50"}`} style={{ borderColor: "var(--color-border-primary)", color: "var(--color-text-primary, #111827)", backgroundColor: "#ffffff" }} aria-label="Add more files">
                        <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Add more
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasChanges = () => {
    const keys = new Set([...Object.keys(formData || {}), ...Object.keys(initialData || {})]);
    for (let key of keys) {
      const current = formData?.[key];
      const initial = initialData?.[key];
      if (Array.isArray(current) || Array.isArray(initial)) {
        if (!Array.isArray(current) || !Array.isArray(initial) || current.length !== initial.length) return true;
        for (let i = 0; i < current.length; i++) {
          const a = current[i];
          const b = initial[i];
          if (a instanceof File || b instanceof File) {
            if (!(a instanceof File) || !(b instanceof File) || a.name !== b.name || a.size !== b.size || a.lastModified !== b.lastModified) return true;
          } else if (a !== b) return true;
        }
        continue;
      }
      if (typeof current === "string" && typeof initial === "string") {
        if (current.trim() !== initial.trim()) return true;
        continue;
      }
      if (current !== initial) {
        if (current == null && initial == null) continue;
        if (current == null || initial == null) return true;
        if (current !== initial) return true;
      }
    }
    return false;
  };

  const isDirty = hasChanges();

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Edit Assignment
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">Update assignment details</p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="assignment-title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input readOnly={isGuest} disabled={isGuest}
                  id="assignment-title"
                  name="title"
                  type="text"
                  maxLength={100}
                  value={formData.title || ""}
                  onChange={handleChange}
                  className={inputClass}
                  style={fieldStyle}
                  required
                />
              </div>

              {renderContentSection()}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="assignment-faculty" className={labelClass}>
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  {renderFaculties("assignment-faculty", formData.faculty)}
                </div>
                <div>
                  <label htmlFor="assignment-division" className={labelClass}>
                    Division <span className="text-red-500">*</span>
                  </label>
                  {renderDivisions("assignment-division", formData.faculty, formData.division)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="assignment-subject" className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {renderSubjects("assignment-subject", formData.subject)}
                </div>
                <div>
                  <label htmlFor="assignment-year" className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  {renderYears("assignment-year", formData.year)}
                </div>
                <div>
                  <label htmlFor="assignment-semester" className={labelClass}>
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {renderSemesters("assignment-semester", formData.semester)}
                </div>
              </div>

              <div>
                <label htmlFor="assignment-date" className={labelClass}>
                  Assignment Date (date and time) <span className="text-red-500">*</span>
                </label>
                <input readOnly={isGuest} disabled={isGuest}
                  id="assignment-date"
                  name="OnlineMeetingDate"
                  type="datetime-local"
                  value={meetingDateValue}
                  onChange={handleChange}
                  className={inputClass}
                  style={fieldStyle}
                  required
                />
              </div>

              <div>
                <label htmlFor="assignment-notes" className={labelClass}>
                  Notes
                </label>
                <textarea readOnly={isGuest} disabled={isGuest}
                  id="assignment-notes"
                  name="notes"
                  maxLength={400}
                  value={formData.notes || formData.description || ""}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputClass} resize-none`}
                  style={fieldStyle}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading || !isDirty}
                className="px-8 rounded-xl font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] py-3"
                style={{
                  backgroundColor: "var(--color-brand-primary)",
                  color: "#ffffff",
                  opacity: isDirty ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (isDirty) e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-brand-primary)";
                }}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 rounded-xl border bg-white font-semibold text-sm cursor-pointer transition-colors hover:bg-gray-50 py-3"
                style={{ borderColor: "var(--color-border-primary)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentEditPage;
