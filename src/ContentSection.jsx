import { FiUploadCloud, FiFile, FiX, FiPlus, FiCheckCircle } from "react-icons/fi";
import {
  CONTENT_TYPES,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
  formatFileSize,
  getFilesTotalSize,
  isSavedDoc,
} from "./contentUtils.js";

const inputClass =
  "w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-4";
const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
const fieldStyle = { borderColor: "var(--color-border-primary)" };

const CONTENT_LABELS = { link: "Link", text: "Text", documents: "Documents" };

const ContentSection = ({
  data,
  setter,
  idPrefix,
  disabled = false,
  allowedTypes = CONTENT_TYPES,
  onSetContentType,
  onFileSelection,
  onRemoveFile,
  onAddMoreFiles,
}) => {
  const type = allowedTypes.includes(data.UploadContentType)
    ? data.UploadContentType
    : allowedTypes[0];
  const files = Array.isArray(data.UploadFiles) ? data.UploadFiles : [];

  const activeStyle = {
    backgroundColor: "var(--color-brand-primary)",
    color: "#ffffff",
    borderColor: "var(--color-brand-primary)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  };

  return (
    <div className="space-y-4">
      <div
        className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border bg-gray-50/80 p-1.5"
        style={{ borderColor: "var(--color-border-primary)" }}
        role="tablist"
        aria-label="Content type"
      >
        {allowedTypes.map((option) => {
          const active = type === option;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSetContentType(setter, option)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150 cursor-pointer ${
                active ? "" : "bg-transparent text-gray-600 hover:bg-white hover:text-gray-900"
              }`}
              style={
                active
                  ? activeStyle
                  : { borderColor: "transparent", backgroundColor: "transparent" }
              }
            >
              {CONTENT_LABELS[option] ?? option}
            </button>
          );
        })}
      </div>

      {type === "link" && (
        <div>
          <label htmlFor={`${idPrefix}-upload-link`} className={labelClass}>
            Link <span className="text-red-500">*</span>
          </label>
          <input
            id={`${idPrefix}-upload-link`}
            name="UploadLink"
            type="url"
            disabled={disabled}
            value={data.UploadLink || ""}
            onChange={(e) => setter((prev) => ({ ...prev, UploadLink: e.target.value }))}
            placeholder="https://example.com/resource"
            className={inputClass}
            style={fieldStyle}
            required={!disabled}
          />
        </div>
      )}

      {type === "text" && (
        <div>
          <label htmlFor={`${idPrefix}-upload-text`} className={labelClass}>
            Text <span className="text-red-500">*</span>
          </label>
          <textarea
            id={`${idPrefix}-upload-text`}
            name="UploadText"
            disabled={disabled}
            value={data.UploadText || ""}
            onChange={(e) => setter((prev) => ({ ...prev, UploadText: e.target.value }))}
            placeholder="Enter text content..."
            rows={6}
            className={`${inputClass} resize-none overflow-y-auto`}
            style={{ ...fieldStyle, minHeight: "160px" }}
            required={!disabled}
          />
        </div>
      )}

      {type === "documents" && (
        <div>
          <label className={labelClass}>
            Documents <span className="text-red-500">*</span>
          </label>
          <div
            className="w-full rounded-2xl border-2 border-dashed p-5 sm:p-6 flex flex-col items-stretch text-center bg-gray-50/60 transition-colors"
            style={{ borderColor: "var(--color-border-primary)" }}
          >
            <div className="flex flex-col items-center justify-center">
              <input
                id={`${idPrefix}-upload-files`}
                type="file"
                multiple
                className="hidden"
                disabled={disabled}
                onChange={(e) => onFileSelection(setter, e)}
              />
              <input
                id={`${idPrefix}-upload-files-add`}
                type="file"
                multiple
                className="hidden"
                disabled={disabled}
                onChange={(e) => onFileSelection(setter, e, { append: true })}
              />
              {files.length === 0 && (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      backgroundColor: "rgba(0,0,0,0.04)",
                      color: "var(--color-brand-primary)",
                    }}
                    aria-hidden="true"
                  >
                    <FiUploadCloud className="w-6 h-6" />
                  </div>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => {
                      if (disabled) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      document.getElementById(`${idPrefix}-upload-files`)?.click();
                    }}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${
                      disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                    }`}
                    style={{ backgroundColor: "var(--color-brand-primary)" }}
                  >
                    Browse files
                  </button>
                  <p className="m-0 mt-2 text-xs text-gray-500">
                    Maximum total size {MAX_FILE_SIZE_LABEL} per upload
                  </p>
                </>
              )}
            </div>

            {files.length > 0 &&
              (() => {
                const totalSize = getFilesTotalSize(files);
                const atLimit = totalSize >= MAX_FILE_SIZE;
                return (
                  <div
                    className="w-full text-left rounded-2xl border bg-white p-4 sm:p-5"
                    style={{ borderColor: "var(--color-border-primary)" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                        <FiCheckCircle size={17} aria-hidden="true" />
                        {files.length} file{files.length > 1 ? "s" : ""} selected
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600">
                        Total:{" "}
                        <span
                          className={
                            totalSize > MAX_FILE_SIZE
                              ? "text-red-600 font-semibold"
                              : "text-gray-900 font-semibold"
                          }
                        >
                          {formatFileSize(totalSize)}
                        </span>
                        <span className="text-gray-400"> / {MAX_FILE_SIZE_LABEL}</span>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto pr-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {files.map((file, idx) => {
                          const name = file.name || file.filename || "file";
                          const size = file instanceof File ? file.size : Number(file.size ?? 0);
                          const saved = isSavedDoc(file);
                          return (
                            <div
                              key={`${file.key ?? name}-${idx}-${size}`}
                              className="group flex items-start gap-3 rounded-xl border bg-gray-50/70 p-3 sm:p-3.5 min-w-0"
                              style={{ borderColor: "var(--color-border-primary)" }}
                              title={name}
                            >
                              <div
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white border text-gray-600 shadow-sm"
                                style={{ borderColor: "var(--color-border-primary)" }}
                                aria-hidden="true"
                              >
                                <FiFile className="w-5 h-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="m-0 text-sm font-semibold text-gray-900 leading-snug break-words line-clamp-3">
                                  {name}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    {formatFileSize(size)}
                                  </span>
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                                      saved
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                        : "border-sky-200 bg-sky-50 text-sky-700"
                                    }`}
                                  >
                                    {saved ? "Saved" : "New"}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onRemoveFile(setter, idx)}
                                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border bg-white text-gray-500 transition-colors ${
                                  disabled
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:text-red-600 hover:border-red-200 hover:bg-red-50 cursor-pointer"
                                }`}
                                style={{ borderColor: "var(--color-border-primary)" }}
                                aria-label={`Remove ${name}`}
                                title="Remove file"
                              >
                                <FiX size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => onAddMoreFiles(idPrefix, files, disabled)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
                        } ${atLimit ? "opacity-50" : ""}`}
                        style={{
                          borderColor: "var(--color-border-primary)",
                          color: "var(--color-text-primary, #111827)",
                          backgroundColor: "#ffffff",
                        }}
                        aria-label="Add more files"
                      >
                        <FiPlus size={16} aria-hidden="true" />
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

export default ContentSection;
