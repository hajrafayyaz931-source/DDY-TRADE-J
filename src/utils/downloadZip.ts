/**
 * Reliable Blob-based project zip downloader.
 * Bypasses iframe navigation constraints and guarantees file download.
 */
export async function downloadProjectZip(): Promise<void> {
  try {
    const response = await fetch('/ddy-trade-journal-complete.zip', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Download failed`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'ddy-trade-journal-complete.zip';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 1500);
  } catch (err) {
    console.error('Blob download failed, falling back to direct link:', err);
    window.location.href = '/ddy-trade-journal-complete.zip';
  }
}
