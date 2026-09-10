/** Early client feedback; this does not replace validation at the API boundary. */
export function imageFileError(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/gif"].includes(file.type))
    return "Choose a JPG, PNG or GIF image.";
  if (file.size > 10 * 1024 * 1024) return "Choose an image smaller than 10 MB.";
  if (file.size === 0) return "This image is empty. Choose another file.";
  return null;
}
