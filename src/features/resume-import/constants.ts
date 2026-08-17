export const MAX_RESUME_SOURCES = 4;
export const MAX_RESUME_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_RESUME_TEXT_CHARS = 20_000;
export const MAX_RESUME_TOTAL_TEXT_CHARS = 60_000;
export const MIN_RESUME_TEXT_CHARS = 80;
export const SOURCE_EXCERPT_MIN_CHARS = 24;
export const SOURCE_EXCERPT_MAX_CHARS = 2_000;
export const SKILLS_SECTION_EXCERPT_MIN_CHARS = 8;
export const SKILLS_SECTION_EXCERPT_MAX_CHARS = 1_500;
export const MAX_EXCERPT_RESUME_FRACTION = 0.4;

export const ALLOWED_RESUME_EXTENSIONS = [
  ".pdf",
  ".docx",
] as const;

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream",
] as const;
