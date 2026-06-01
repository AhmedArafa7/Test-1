import { environment } from '../../../environments/environment';

const ABSOLUTE_URL_PATTERN = /^[a-z][a-z\d+.-]*:/i;

function getBackendOrigin(): string {
  const browserOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://localhost';

  try {
    return new URL(environment.apiUrl, browserOrigin).origin;
  } catch {
    return browserOrigin;
  }
}

export function resolveBackendAssetUrl(url?: string | null): string | undefined {
  if (!url?.trim()) {
    return undefined;
  }

  const trimmedUrl = url.trim();

  if (trimmedUrl.startsWith('data:') || ABSOLUTE_URL_PATTERN.test(trimmedUrl)) {
    return trimmedUrl;
  }

  const normalizedPath = trimmedUrl.startsWith('/') ? trimmedUrl : `/${trimmedUrl}`;
  return `${getBackendOrigin()}${normalizedPath}`;
}

export function buildPropertyPlaceholder(label?: string, placeholderText = ''): string {
  // Generate a clean SVG placeholder instead of fake photos
  const initial = label ? label.charAt(0) : '🏠';
  const textElement = placeholderText
    ? `<text x="400" y="350" text-anchor="middle" fill="%2394a3b8" font-family="Arial,sans-serif" font-size="14" font-weight="bold">${placeholderText}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="800" height="600" fill="%23f1f5f9"/>
    <g transform="translate(400,260)">
      <path d="M-40,20 L0,-30 L40,20 Z" fill="none" stroke="%23cbd5e1" stroke-width="3"/>
      <rect x="-30" y="20" width="60" height="40" fill="none" stroke="%23cbd5e1" stroke-width="3" rx="2"/>
      <rect x="-10" y="35" width="20" height="25" fill="none" stroke="%23cbd5e1" stroke-width="3" rx="1"/>
    </g>
    ${textElement}
  </svg>`;
  return `data:image/svg+xml,${svg}`;
}

export function getPropertyImageUrl(url?: string | null, label?: string, placeholderText = ''): string {
  return resolveBackendAssetUrl(url) ?? buildPropertyPlaceholder(label, placeholderText);
}

/**
 * Compresses an image file before uploading to reduce payload size.
 * Resizes to a maximum of 1024px width/height and uses JPEG compression.
 */
export async function compressImage(input: File | string, maxWidth = 1024, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxWidth) {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
    };

    if (typeof input === 'string') {
      processImage(input);
    } else {
      // Handle File object
      if (input.type === 'image/heic' || input.name.toLowerCase().endsWith('.heic')) {
        reject(new Error('HEIC format is not supported directly. Please use JPEG or PNG.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => processImage(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(input);
    }
  });
}
