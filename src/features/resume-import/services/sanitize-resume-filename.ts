export function sanitizeResumeFilename(
  filename: string,
): string {
  const base = filename
    .replace(/\\/g, "/")
    .split("/")
    .pop()
    ?.trim() ?? "";

  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[<>:"|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned || cleaned === "." || cleaned === "..") {
    return "resume";
  }

  return cleaned.slice(0, 120);
}
