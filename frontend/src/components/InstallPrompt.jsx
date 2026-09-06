import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

/**
 * InstallPrompt — shows a subtle mobile-first install banner.
 * Uses the beforeinstallprompt event on Android/Chrome and gives iOS Safari
 * users step-by-step instructions.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("cm_install_dismissed") === "1") {
      setDismissed(true);
      return;
    }
    // Already installed?
    if (
      window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      setDismissed(true);
      return;
    }
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS detection (no beforeinstallprompt on iOS Safari)
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const inStandalone = "standalone" in window.navigator && window.navigator.standalone;
    if (isIOS && !inStandalone) {
      setShowIOS(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    localStorage.setItem("cm_install_dismissed", "1");
    setDismissed(true);
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") dismiss();
    setDeferred(null);
  };

  if (dismissed) return null;
  if (!deferred && !showIOS) return null;

  return (
    <div
      data-testid="install-prompt"
      className="fixed left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-[#141414] border border-[#FFCD00]/40 rounded-sm shadow-2xl p-4"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom))" }}
    >
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-white/40 hover:text-white p-1"
        aria-label="Dismiss install prompt"
        data-testid="install-prompt-dismiss"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#FFCD00] text-black flex items-center justify-center rounded-sm font-display text-lg shrink-0">
          CM
        </div>
        <div className="flex-1">
          <div className="font-display text-lg uppercase tracking-wide leading-tight">
            Install Court Mastery
          </div>
          <div className="text-xs text-white/60 mt-1 leading-relaxed">
            {showIOS
              ? "Tap the Share button in Safari, then Add to Home Screen."
              : "Add to your phone for a full-screen app experience, faster load and offline access."}
          </div>
          <div className="mt-3 flex items-center gap-2">
            {deferred && !showIOS && (
              <button
                data-testid="install-prompt-install"
                onClick={install}
                className="btn-primary"
                style={{ padding: "0.4rem 0.85rem" }}
              >
                <Download size={13} /> Install
              </button>
            )}
            {showIOS && (
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-[#FFCD00] font-bold">
                <Share size={12} /> Then Add to Home Screen
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
