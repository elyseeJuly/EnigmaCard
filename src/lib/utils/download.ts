export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.append(link);
  link.click();

  // Some mobile browsers defer transfer startup; avoid revoking too early.
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 30_000);
}
