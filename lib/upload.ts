
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_UPLOAD_PRESET;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export class UploadError extends Error {}

export async function uploadImage(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new UploadError("Image uploads are not configured.");
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new UploadError("Only JPG, PNG and WebP images are allowed.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new UploadError("Images must be smaller than 5 MB.");
  }

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body }
  );

  if (!response.ok) throw new UploadError("The image could not be uploaded.");

  const data = (await response.json()) as { secure_url?: string };
  if (!data.secure_url) throw new UploadError("The upload returned no image URL.");

  return data.secure_url;
}
