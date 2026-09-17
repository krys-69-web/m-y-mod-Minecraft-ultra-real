/**
 * Reliable multi-fallback download utility for slm_visual_pack-real
 * Handles sandboxed iframe restrictions, mobile Android browsers, and avoids premature blob revocation.
 */

export type DownloadType = 'zip' | 'addon-zip' | 'mcpack' | 'mcaddon';

export function getFilenameForType(type: DownloadType): string {
  switch (type) {
    case 'addon-zip':
      return 'slm_addon_complet.zip';
    case 'zip':
      return 'slm_visual_pack-real.zip';
    case 'mcpack':
      return 'slm_visual_pack-real.mcpack';
    case 'mcaddon':
      return 'slm_visual_pack-real.mcaddon';
    default:
      return 'slm_visual_pack-real.zip';
  }
}

export async function downloadViaBlob(
  type: DownloadType,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  const filename = getFilenameForType(type);
  try {
    const url = `/api/download/${type}`;

    if (onProgress) onProgress(15);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erreur serveur HTTP ${response.status}`);
    }

    if (onProgress) onProgress(50);

    const blob = await response.blob();

    if (onProgress) onProgress(85);

    // Create object URL with application/zip or application/octet-stream
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Keep blob URL alive for 30s so mobile browser download manager finishes saving without truncating the archive
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 30000);

    if (onProgress) onProgress(100);
    return true;
  } catch (err) {
    console.warn('Blob download failed, falling back to direct navigation:', err);
    triggerDirectDownload(type);
    if (onProgress) onProgress(100);
    return true;
  }
}

export function triggerDirectDownload(type: DownloadType) {
  const filename = getFilenameForType(type);
  const url = `/${filename}`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadViaBase64(
  type: DownloadType,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  try {
    if (onProgress) onProgress(20);
    const res = await fetch(`/api/download-base64/${type}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    if (onProgress) onProgress(60);
    const data = await res.json();
    const { filename, mimeType, base64 } = data;

    // Convert base64 into a real binary blob rather than data: URI to avoid Chrome Android 2MB truncation
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType || 'application/zip' });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 30000);

    if (onProgress) onProgress(100);
    return true;
  } catch (err) {
    console.error('Base64 download failed, using direct link:', err);
    triggerDirectDownload(type);
    return false;
  }
}
