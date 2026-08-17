import {
  ALLOWED_RESUME_EXTENSIONS,
  ALLOWED_RESUME_MIME_TYPES,
  MAX_RESUME_FILE_BYTES,
} from "../constants";

export type ResumeFileKind = "pdf" | "docx";

export type ResumeFileValidationError = {
  code:
    | "unsupported-type"
    | "too-large"
    | "empty";
  message: string;
};

export type ResumeFileValidationResult =
  | {
      ok: true;
      kind: ResumeFileKind;
    }
  | {
      ok: false;
      error: ResumeFileValidationError;
    };

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
const ZIP_MAGIC = [0x50, 0x4b]; // PK

function getExtension(filename: string): string {
  const match = filename.toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function startsWithBytes(
  bytes: Uint8Array,
  magic: number[],
): boolean {
  if (bytes.length < magic.length) {
    return false;
  }

  return magic.every((value, index) => bytes[index] === value);
}

export function validateResumeFile(input: {
  filename: string;
  mimeType?: string;
  bytes: Uint8Array;
}): ResumeFileValidationResult {
  if (input.bytes.byteLength === 0) {
    return {
      ok: false,
      error: {
        code: "empty",
        message: "We could not find any resume text in that file.",
      },
    };
  }

  if (input.bytes.byteLength > MAX_RESUME_FILE_BYTES) {
    return {
      ok: false,
      error: {
        code: "too-large",
        message:
          "That file is too large. Use a file under 2 MB, or paste the text.",
      },
    };
  }

  const extension = getExtension(input.filename);
  const mimeType = input.mimeType?.toLowerCase() ?? "";

  if (
    extension &&
    !ALLOWED_RESUME_EXTENSIONS.includes(
      extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
    )
  ) {
    return {
      ok: false,
      error: {
        code: "unsupported-type",
        message:
          "That file type is not supported. Upload a PDF or DOCX, or paste your resume text.",
      },
    };
  }

  if (
    mimeType &&
    !ALLOWED_RESUME_MIME_TYPES.includes(
      mimeType as (typeof ALLOWED_RESUME_MIME_TYPES)[number],
    )
  ) {
    return {
      ok: false,
      error: {
        code: "unsupported-type",
        message:
          "That file type is not supported. Upload a PDF or DOCX, or paste your resume text.",
      },
    };
  }

  const isPdf =
    (extension === ".pdf" || mimeType === "application/pdf") &&
    startsWithBytes(input.bytes, PDF_MAGIC);

  const isDocx =
    (extension === ".docx" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document") &&
    startsWithBytes(input.bytes, ZIP_MAGIC);

  if (isPdf) {
    return { ok: true, kind: "pdf" };
  }

  if (isDocx) {
    return { ok: true, kind: "docx" };
  }

  return {
    ok: false,
    error: {
      code: "unsupported-type",
      message:
        "That file type is not supported. Upload a PDF or DOCX, or paste your resume text.",
    },
  };
}
