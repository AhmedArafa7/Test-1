/**
 * Frontend environment configuration.
 *
 * ─── Cloudinary CORS / Upload Preset Notes ────────────────────────────────
 * The frontend uploads images DIRECTLY to Cloudinary from the browser using
 * an unsigned upload preset. This requires the following Cloudinary setup:
 *
 *   1. Add `https://localhost:4200` (and your production frontend origin) to
 *      Settings → Security → Allowed referral URLs / CORS in Cloudinary.
 *   2. Create an unsigned upload preset named `cloudinaryUploadPreset` and
 *      tag uploads with `tags=baytology_upload` (we read that tag for audit).
 *   3. Free tier limit: 25k images / 25GB storage. For production consider
 *      Cloudinary Advanced or self-hosted S3/ImgBB.
 *
 * If you switch providers (S3, Azure Blob, ImgBB), update CloudinaryService
 * AND set the new env values below.
 * ──────────────────────────────────────────────────────────────────────────
 */
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7053/api/v1',
  hubUrl: 'https://localhost:7053/hubs',
  googleClientId: '638341844344-jio69o71pdeg26fuar0qlb24i0eu6fnm.apps.googleusercontent.com',
  cloudinaryCloudName: 'dtyjzvfnk',
  cloudinaryUploadPreset: 'ml_default',
  bookingServiceFeeRate: 0.025,
};
