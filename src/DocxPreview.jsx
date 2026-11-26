import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

// Renders a Word document (Blob/File/ArrayBuffer) with docx-preview.
//
// fit="container" stretches the pages to the width of the wrapper (used for
// card thumbnails), while fit="width" keeps the document's own page width so
// the detail view scrolls horizontally instead of squashing the layout.
const DocxPreview = ({
  blob,
  className = "",
  style,
  fit = "width",
  lazy = false,
  onError,
}) => {
  const hostRef = useRef(null);
  const errorHandlerRef = useRef(onError);
  const [visible, setVisible] = useState(!lazy);
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    errorHandlerRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!lazy) return;
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !blob || !visible) return undefined;
    let cancelled = false;
    setPhase("rendering");
    host.innerHTML = "";
    renderAsync(blob, host, undefined, {
      className: "docx-preview",
      inWrapper: true,
      ignoreWidth: fit === "container",
      ignoreHeight: false,
      breakPages: true,
      ignoreFonts: false,
      useBase64URL: true,
      renderHeaders: true,
      renderFooters: true,
    })
      .then(() => {
        if (cancelled) return;
        setPhase("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        host.innerHTML = "";
        setPhase("error");
        errorHandlerRef.current?.(error);
      });
    return () => {
      cancelled = true;
    };
  }, [blob, visible, fit]);

  useEffect(
    () => () => {
      const host = hostRef.current;
      if (host) host.innerHTML = "";
    },
    [],
  );

  return (
    <div className={`relative ${className}`} style={style}>
      <div ref={hostRef} className="w-full h-full overflow-auto bg-white" />
      {phase === "rendering" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85">
          <span className="text-xs font-semibold text-gray-500">
            Rendering document…
          </span>
        </div>
      )}
      {phase === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-600">
            Document preview
          </span>
          <span className="text-xs text-gray-500">
            This Word file could not be rendered. Download it to view the full
            document.
          </span>
        </div>
      )}
    </div>
  );
};

export default DocxPreview;
