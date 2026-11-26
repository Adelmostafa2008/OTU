import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import api from "./AxiosHelper";
import { useSnack } from "./SnackBarContext.jsx";
import { FormSkeleton } from "./Skeleton";
import ContentSection from "./ContentSection.jsx";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
  buildContentPayload,
  formatFileSize,
  getFilesTotalSize,
  isSavedDoc,
  pickField,
  toSavedDocs,
} from "./contentUtils.js";
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
const LESSON_TYPES = ["Lab", "Lecture"];
const CONTENT_TYPES = ["link", "text", "documents"];

const inputClass =
  "w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";
const selectClass = `${inputClass} cursor-pointer truncate text-ellipsis pr-10`;
const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
const fieldStyle = { borderColor: "var(--color-border-primary)" };

const emptyLessonEdit = () => ({
  title: "",
  type: "Lecture",
  faculty: "",
  division: "",
  subject: "",
  year: "",
  semester: "",
  notes: "",
  userid: "",
  UploadContentType: "link",
  UploadLink: "",
  UploadText: "",
  UploadFiles: [],
});

// The lesson endpoint answers with these properties:
//   id, Faculty, Division, Subject, Year, semester, title
//   Type?, UploadContentType?, link?, text?, notes?, files?
// The casing is not consistent (`faculty`/`Faculty`, `uploadContentType`/
// `UploadContentType`), so each one is read through `pickField`. Anything
// marked with ? may arrive as null, so every value is read through `asText` to
// keep the form state as plain, controlled strings.
const asText = (value) => (value === null || value === undefined ? "" : String(value));

const getUserId = (user) =>
  user?.id || user?.userId || user?._id || user?.Id || user?.userID || "";

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data.trim();
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

// The endpoint labels the documents tab "document" (singular), while the form
// and ContentSection use "documents" internally. Both spellings are accepted.
const normalizeContentTab = (value) => {
  const declared = asText(value).trim().toLowerCase();
  if (declared === "document" || declared === "documents") return "documents";
  if (declared === "text") return "text";
  if (declared === "link") return "link";
  return "";
};

const isFileObject = (file) => typeof File !== "undefined" && file instanceof File;

const getNewFiles = (files) =>
  (Array.isArray(files) ? files : []).filter((file) => isFileObject(file));

const getSavedKeys = (files) =>
  (Array.isArray(files) ? files : [])
    .filter((file) => isSavedDoc(file) && !isFileObject(file))
    .map((file) => String(file.key ?? ""))
    .filter(Boolean);

const normalizeLesson = (raw) => {
  const source = raw ?? {};

  const files = toSavedDocs(pickField(source, "files", "docs", "UploadFiles"));
  const link = asText(pickField(source, "link", "UploadLink"));
  const text = asText(pickField(source, "text", "UploadText"));
  const declared = normalizeContentTab(
    pickField(source, "UploadContentType", "uploadContentType", "upload_content_type"),
  );

  // UploadContentType is nullable, so when it is missing/empty the tab is
  // derived from the content the lesson actually carries (files, then text).
  let contentType;
  if (CONTENT_TYPES.includes(declared)) {
    contentType = declared;
  } else if (files.length > 0) {
    contentType = "documents";
  } else if (text.trim()) {
    contentType = "text";
  } else {
    contentType = "link";
  }

  // Type is nullable too: an absent value keeps the form on its default, and
  // casing variants like "lab" still map onto the matching option.
  const lessonType = LESSON_TYPES.find(
    (option) =>
      option.toLowerCase() ===
      asText(pickField(source, "Type", "type")).trim().toLowerCase(),
  );
  const semester = asText(pickField(source, "semester")).trim().toLowerCase();

  return {
    title: asText(pickField(source, "title")),
    type: lessonType ?? "Lecture",
    faculty: asText(pickField(source, "faculty")),
    division: asText(pickField(source, "division")),
    subject: asText(pickField(source, "subject")),
    year: asText(pickField(source, "year")),
    semester: SEMESTERS.includes(semester) ? semester : "",
    notes: asText(pickField(source, "notes", "description")),
    UploadContentType: contentType,
    UploadLink: link,
    UploadText: text,
    UploadFiles: files,
  };
};

const uploadFilesToStorage = async (response, files) => {
  if (!Array.isArray(response?.data)) return;
  const list = Array.isArray(files) ? files : [];

  await Promise.all(
    response.data.map(async (item, index) => {
      const file = list[index];
      if (!file || !isFileObject(file)) return;

      await s3Client.put(item.url, file, {
        headers: {
          "Content-Type": file.type,
        },
      });
    }),
  );
};

const LessonEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, isGuest } = useAuth();
  const { ShowSnackBar } = useSnack();
  const [cool, setCool] = useState(false);

  const handelSnack = (msg, ty) => {
    if (!cool) {
      setCool(true);
      ShowSnackBar(msg, ty);
      setTimeout(() => {
        setCool(false);
      }, 5000);
    }
  };

  // The route id is authoritative, but the payload's own `id` is used as a
  // fallback so deep links/state hydration still address the right lesson.
  const [lessonId, setLessonId] = useState(
    id ?? location.state?.lesson?.id ?? "",
  );

  const [formData, setFormData] = useState(() =>
    location.state?.lesson
      ? { ...normalizeLesson(location.state.lesson), userid: getUserId(user) }
      : { ...emptyLessonEdit(), userid: getUserId(user) },
  );
  // Keys of already saved documents the user removed (directly or by leaving
  // the documents tab). Nothing is sent until the user presses save.
  const [deletedKeys, setDeletedKeys] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    const role = String(user.role ?? "").toLowerCase();
    if (role !== "admin" && role !== "instructor") {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    let cancelled = false;

    const fetchLesson = async () => {
      setFetching(true);
      try {
        const userId = getUserId(user);
        const response = await api.get(`student/lessoneditget/${lessonId}?userid=${userId}`);
        if (cancelled) return;
        if (response?.data) {
          if (
            response.data.id !== null &&
            response.data.id !== undefined &&
            String(response.data.id) !== String(lessonId)
          ) {
            setLessonId(response.data.id);
          }
          setFormData((prev) => ({
            ...normalizeLesson(response.data),
            userid: prev.userid || getUserId(user),
          }));
          setDeletedKeys([]);
        }
      } catch (err) {
        if (cancelled) return;
        if (!location.state?.lesson) {
          handelSnack(getErrorMessage(err, "Failed to load lesson."), "error");
        }
      } finally {
        if (!cancelled) setFetching(false);
      }
    };

    fetchLesson();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "title") nextValue = value.slice(0, 100);
    if (name === "notes") nextValue = value.slice(0, 400);

    setFormData((prev) => {
      const next = { ...prev, [name]: nextValue };
      if (name === "faculty") next.division = "";
      return next;
    });
  };

  // Switching tabs is intent only: leaving "documents" queues the keys of every
  // saved document still on screen, but the documents stay selected so coming
  // back to the tab shows them again (and un-queues those keys).
  const handleSetContentType = (_setter, nextType) => {
    const currentType = formData.UploadContentType || "link";
    if (currentType === nextType) return;

    if (currentType === "documents") {
      const keys = getSavedKeys(formData.UploadFiles);
      if (keys.length > 0) {
        setDeletedKeys((prev) => Array.from(new Set([...prev, ...keys])));
      }
    } else if (nextType === "documents") {
      const visible = new Set(getSavedKeys(formData.UploadFiles));
      setDeletedKeys((prev) => prev.filter((key) => !visible.has(key)));
    }

    setFormData((prev) => ({ ...prev, UploadContentType: nextType }));
  };

  const handleFileSelection = (_setter, e, { append = false } = {}) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (selected.length === 0) return;

    setFormData((prev) => {
      const currentFiles = Array.isArray(prev.UploadFiles) ? prev.UploadFiles : [];
      const baseFiles = append ? currentFiles : [];
      const oversized = selected.find((file) => file.size > MAX_FILE_SIZE);
      if (oversized) {
        handelSnack(
          `"${oversized.name}" is ${formatFileSize(oversized.size)}, which is over the ${MAX_FILE_SIZE_LABEL} limit. Please choose a smaller file.`,
          "warn",
        );
        return prev;
      }
      const nextFiles = [...baseFiles, ...selected];
      if (getFilesTotalSize(nextFiles) > MAX_FILE_SIZE) {
        handelSnack(
          `Total file size cannot exceed ${MAX_FILE_SIZE_LABEL} per upload.`,
          "warn",
        );
        return prev;
      }
      return { ...prev, UploadFiles: nextFiles, UploadContentType: "documents" };
    });
  };

  const handleRemoveFile = (_setter, index) => {
    const currentFiles = Array.isArray(formData.UploadFiles) ? formData.UploadFiles : [];
    const target = currentFiles[index];

    // Only already saved documents have a key to delete on the server.
    if (isSavedDoc(target) && !isFileObject(target)) {
      if (target.key) {
        setDeletedKeys((prev) =>
          prev.includes(target.key) ? prev : [...prev, String(target.key)],
        );
      } else {
        // The endpoint deletes by key, so a descriptor without one cannot be
        // removed server-side; say so rather than pretending it was saved.
        handelSnack(
          `"${target.filename || "This document"}" cannot be removed because the server did not provide its key.`,
          "warn",
        );
        return;
      }
    }

    setFormData((prev) => {
      const files = Array.isArray(prev.UploadFiles) ? prev.UploadFiles : [];
      return { ...prev, UploadFiles: files.filter((_, i) => i !== index) };
    });
  };

  const handleAddMoreFiles = (idPrefix, files, disabled) => {
    if (disabled) return;
    if (getFilesTotalSize(files) >= MAX_FILE_SIZE) {
      handelSnack("Size cannot exceed the maximum size of upload per time.", "warn");
      return;
    }
    document.getElementById(`${idPrefix}-upload-files-add`)?.click();
  };

  const newFiles = getNewFiles(formData.UploadFiles);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || isGuest) return;

    const required = ["title", "type", "subject", "faculty", "division", "year", "semester"];
    const labels = {
      title: "Title",
      type: "Type",
      subject: "Subject",
      faculty: "Faculty",
      division: "Division",
      year: "Year",
      semester: "Semester",
    };
    const missing = required
      .filter((field) => !String(formData[field] ?? "").trim())
      .map((field) => labels[field]);
    if (missing.length > 0) {
      handelSnack(`Please fill in: ${missing.join(", ")}.`, "warn");
      return;
    }
    if (String(formData.title ?? "").length > 100) {
      handelSnack("Title must be at most 100 characters.", "warn");
      return;
    }
    if (String(formData.notes ?? "").length > 400) {
      handelSnack("Notes must be at most 400 characters.", "warn");
      return;
    }

    const contentType = formData.UploadContentType || "link";
    if (contentType === "link" && !String(formData.UploadLink ?? "").trim()) {
      handelSnack("Please provide a link.", "warn");
      return;
    }
    if (contentType === "text" && !String(formData.UploadText ?? "").trim()) {
      handelSnack("Please provide text content.", "warn");
      return;
    }
    // The documents tab keeps already saved attachments in UploadFiles next to
    // the newly chosen ones, so any entry means the tab has content.
    if (
      contentType === "documents" &&
      (!Array.isArray(formData.UploadFiles) || formData.UploadFiles.length === 0)
    ) {
      handelSnack("Please select at least one document.", "warn");
      return;
    }
    if (getFilesTotalSize(newFiles) > MAX_FILE_SIZE) {
      handelSnack(`Total file size cannot exceed ${MAX_FILE_SIZE_LABEL} per upload.`, "warn");
      return;
    }

    setSaving(true);

    try {
      const userId = getUserId(user);
      // New documents only belong to the lesson while the documents tab is the
      // active content; hidden files from a previous tab are never uploaded.
      const docsToAdd = formData.UploadContentType === "documents" ? newFiles : [];
      const submission = buildContentPayload(
        { ...formData, userid: userId || formData.userid, UploadFiles: docsToAdd },
        { includeType: true },
      );

      // 1. Removed documents go first (the only request that takes key strings).
      if (deletedKeys.length > 0) {
        console.log(deletedKeys);
        
        await api.put(`/Upload/deletefiles/${lessonId}`, deletedKeys, {
          withCredentials: true,
        });
      }

      // 2. New documents are registered and then pushed to cloud storage.
      if (docsToAdd.length > 0) {
        const addResponse = await api.put(`/Upload/addfiles/${lessonId}`, submission, {
          withCredentials: true,
        });
        await uploadFilesToStorage(addResponse, docsToAdd);
      }

      // 3. Finally the lesson fields themselves are updated. The add/delete
      // endpoints own the document list, so the lesson update never carries
      // it: sending only the newly added files here would replace the saved
      // attachments instead of appending to them.
      const updatePayload = { ...submission };
      delete updatePayload.docs;

      const response = await api.put(`/Upload/${lessonId}`, updatePayload, {
        withCredentials: true,
      });

      handelSnack(response?.data?.message ?? "Lesson updated successfully.", "success");
      navigate(`/lesson/${lessonId}`);
    } catch (err) {
      handelSnack(
        getErrorMessage(err, "Failed to update lesson. Please try again."),
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  if (
    authLoading ||
    !user ||
    String(user.role ?? "").toLowerCase() === "student" ||
    String(user.role ?? "").toLowerCase() === "guest"
  ) {
    return null;
  }

  if (fetching) {
    return <FormSkeleton />;
  }

  const renderSubjects = (id, value) => (
    <select
      id={id}
      name="subject"
      value={value}
      onChange={handleChange}
      className={selectClass}
      style={fieldStyle}
      disabled={isGuest}
      required
    >
      <option value="">Select subject</option>
      {SUBJECTS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderFaculties = (id, value) => (
    <select
      id={id}
      name="faculty"
      value={value}
      onChange={handleChange}
      className={selectClass}
      style={fieldStyle}
      disabled={isGuest}
      required
    >
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
      <select
        id={id}
        name="division"
        value={value}
        onChange={handleChange}
        className={selectClass}
        style={fieldStyle}
        disabled={isGuest || options.length === 0}
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
    <select
      id={id}
      name="year"
      value={value}
      onChange={handleChange}
      className={selectClass}
      style={fieldStyle}
      disabled={isGuest}
      required
    >
      <option value="">Select year</option>
      {YEARS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const renderSemesters = (id, value) => (
    <select
      id={id}
      name="semester"
      value={value}
      onChange={handleChange}
      className={selectClass}
      style={fieldStyle}
      disabled={isGuest}
      required
    >
      <option value="">Select semester</option>
      {SEMESTERS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  const pendingAdds = formData.UploadContentType === "documents" ? newFiles.length : 0;
  const pendingChanges =
    (deletedKeys.length > 0 ? `${deletedKeys.length} to remove` : "") +
    (pendingAdds > 0 ? `${deletedKeys.length > 0 ? " · " : ""}${pendingAdds} to add` : "");

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="text-left">
        <h1 className="m-0 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Edit Lesson
        </h1>
        <p className="m-0 mt-2 text-sm sm:text-base text-gray-500">
          Update the lesson details and its attached documents
        </p>
      </div>

      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className="bg-white border rounded-2xl p-6 sm:p-8"
            style={{ borderColor: "var(--color-border-primary)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="lesson-title" className={labelClass}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="lesson-title"
                  name="title"
                  type="text"
                  maxLength={100}
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter lesson title"
                  className={inputClass}
                  style={fieldStyle}
                  disabled={isGuest}
                  required
                />
              </div>

              <ContentSection
                data={formData}
                setter={setFormData}
                idPrefix="lesson-edit"
                disabled={isGuest}
                onSetContentType={handleSetContentType}
                onFileSelection={handleFileSelection}
                onRemoveFile={handleRemoveFile}
                onAddMoreFiles={handleAddMoreFiles}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="lesson-type" className={labelClass}>
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="lesson-type"
                    name="type"
                    value={LESSON_TYPES.includes(formData.type) ? formData.type : "Lecture"}
                    onChange={handleChange}
                    className={selectClass}
                    style={fieldStyle}
                    disabled={isGuest}
                    required
                  >
                    {LESSON_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="lesson-subject" className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>
                  {renderSubjects("lesson-subject", formData.subject)}
                </div>

                <div>
                  <label htmlFor="lesson-faculty" className={labelClass}>
                    Faculty <span className="text-red-500">*</span>
                  </label>
                  {renderFaculties("lesson-faculty", formData.faculty)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="lesson-year" className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  {renderYears("lesson-year", formData.year)}
                </div>

                <div>
                  <label htmlFor="lesson-semester" className={labelClass}>
                    Semester <span className="text-red-500">*</span>
                  </label>
                  {renderSemesters("lesson-semester", formData.semester)}
                </div>

                <div>
                  <label htmlFor="lesson-division" className={labelClass}>
                    Division <span className="text-red-500">*</span>
                  </label>
                  {renderDivisions("lesson-division", formData.faculty, formData.division)}
                </div>
              </div>

              <div>
                <label htmlFor="lesson-notes" className={labelClass}>
                  Notes
                </label>
                <textarea
                  id="lesson-notes"
                  name="notes"
                  maxLength={400}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about this lesson..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                  style={fieldStyle}
                  disabled={isGuest}
                />
              </div>
            </div>

            {pendingChanges && (
              <p className="m-0 mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-amber-800">
                Documents pending save: {pendingChanges}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving || isGuest}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold text-sm tracking-tight transition-all disabled:cursor-not-allowed active:scale-[0.99] ${
                  isGuest ? "opacity-60" : "disabled:opacity-85"
                }`}
                style={{ backgroundColor: "var(--color-brand-primary)", color: "var(--color-text-white)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-brand-primary)")}
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/lesson/${lessonId}`)}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border bg-white text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed cursor-pointer"
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

export default LessonEditPage;
