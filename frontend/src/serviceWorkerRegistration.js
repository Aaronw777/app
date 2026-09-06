/**
 * Registers the Court Mastery service worker (PWA support).
 * Call registerSW() once from index.js.
 */
export function registerSW() {
  if (
    "serviceWorker" in navigator &&
    (window.location.protocol === "https:" ||
      window.location.hostname === "localhost")
  ) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .catch(() => {
          /* ignore registration failures */
        });
    });
  }
}
