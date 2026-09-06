import { useState } from "react";
import { API } from "@/lib/api";

/**
 * CoverReel — renders a program cover as either an image or a muted-autoplay
 * hype-reel video. Auto-detects by first attempting <img>; if it fails, we
 * swap to <video>. Falls back gracefully to nothing if both fail.
 *
 * Props:
 *   mediaId: string (required)
 *   className: extra classes for wrapper
 *   muted / loop / autoPlay default to true for the reel effect
 */
export default function CoverReel({
  mediaId,
  className = "",
  muted = true,
  loop = true,
  autoPlay = true,
  playsInline = true,
  controls = false,
}) {
  const [mode, setMode] = useState("image"); // "image" | "video" | "none"
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cm_token") : null;
  if (!mediaId) return null;
  const src = `${API}/media/${mediaId}${token ? `?auth=${token}` : ""}`;

  if (mode === "none") return null;

  return (
    <div className={className} data-testid="cover-reel">
      {mode === "image" ? (
        <img
          src={src}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setMode("video")}
        />
      ) : (
        <video
          src={src}
          className="w-full h-full object-cover"
          muted={muted}
          loop={loop}
          autoPlay={autoPlay}
          playsInline={playsInline}
          controls={controls}
          preload="metadata"
          onError={() => setMode("none")}
          data-testid="cover-reel-video"
        />
      )}
    </div>
  );
}
