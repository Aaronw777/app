import { useEffect, useRef, useState } from "react";
import { api, API } from "@/lib/api";
import { Upload, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";

/**
 * MediaUpload — reusable image/video uploader.
 *
 * Props:
 *   kind: "team-logo" | "player-photo" | "drill-media" | "session-photo" | "program-cover"
 *   value: media_id | null — currently attached media
 *   onChange: (mediaId | null) => void
 *   accept: "image/*" (default) | "image/*,video/*" | "video/*"
 *   label: optional string
 *   size: "sm" | "md" | "lg" — visual scale
 */
export default function MediaUpload({
  kind,
  value,
  onChange,
  accept = "image/*",
  label,
  size = "md",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  // Track content_type from the most recent upload so we can preview mp4 vs jpg
  // correctly. When `value` changes externally we assume the caller knows.
  const [lastKind, setLastKind] = useState(null);

  const dim =
    size === "sm"
      ? "w-16 h-16"
      : size === "lg"
      ? "w-40 h-40"
      : "w-24 h-24";

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const { data } = await api.post("/media/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLastKind(data.content_type?.startsWith("video/") ? "video" : "image");
      onChange(data.id);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // When `value` changes (external), reset lastKind so we fall back to accept.
  useEffect(() => {
    if (!value) setLastKind(null);
  }, [value]);

  const clear = (e) => {
    e.stopPropagation();
    setLastKind(null);
    onChange(null);
  };

  // Decide preview type: latest upload wins, else default per accept.
  const isVideo = lastKind
    ? lastKind === "video"
    : accept.includes("video") && !accept.includes("image");
  const canBeEither = accept.includes("video") && accept.includes("image");
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cm_token") : null;
  const src = value ? `${API}/media/${value}${token ? `?auth=${token}` : ""}` : null;

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        data-testid={`media-upload-${kind}`}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`${dim} relative border border-white/15 hover:border-[#FFCD00] rounded-sm overflow-hidden bg-black/40 flex items-center justify-center text-white/50 hover:text-[#FFCD00] transition-colors shrink-0`}
        aria-label={label || `Upload ${kind}`}
      >
        {value && !isVideo && (
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            onError={() => {
              // Might be a video — try that renderer instead.
              if (canBeEither) setLastKind("video");
            }}
          />
        )}
        {value && isVideo && (
          <video
            src={src}
            className="w-full h-full object-cover"
            muted
            playsInline
            autoPlay
            loop
            preload="metadata"
          />
        )}
        {!value && !uploading && (
          <div className="flex flex-col items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-bold">
            {isVideo ? <VideoIcon size={16} /> : <ImageIcon size={16} />}
            <span>Upload</span>
          </div>
        )}
        {uploading && (
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold animate-pulse">
            ...
          </div>
        )}
        {value && (
          <span
            role="button"
            data-testid={`media-remove-${kind}`}
            onClick={clear}
            className="absolute top-1 right-1 w-5 h-5 bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100"
            aria-label="Remove"
          >
            <X size={11} />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => upload(e.target.files?.[0])}
        className="hidden"
        data-testid={`media-input-${kind}`}
      />
      {label && (
        <div className="text-xs text-white/60">
          <div className="uppercase tracking-[0.2em] font-bold text-[10px] text-white/50">
            {label}
          </div>
          <div className="mt-1">
            {value
              ? "Click image to change · × to remove"
              : `Tap to add ${isVideo ? "a video" : "an image"}`}
          </div>
        </div>
      )}
    </div>
  );
}

/** Small helper that displays a media image or video (with auth query param). */
export function MediaImage({ mediaId, className, alt = "", isVideo = false }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cm_token") : null;
  if (!mediaId) return null;
  const src = `${API}/media/${mediaId}${token ? `?auth=${token}` : ""}`;
  if (isVideo) {
    return (
      <video
        src={src}
        className={className}
        controls
        preload="metadata"
        data-testid="media-video"
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="media-image"
    />
  );
}
