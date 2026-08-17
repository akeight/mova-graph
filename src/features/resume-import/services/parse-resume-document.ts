import mammoth from "mammoth";
import { extractText } from "unpdf";

import {
  MAX_RESUME_TEXT_CHARS,
  MIN_RESUME_TEXT_CHARS,
} from "../constants";

import type { ResumeFileKind } from "./validate-resume-file";

export type ResumeParseErrorCode =
  | "unreadable-pdf"
  | "image-only-pdf"
  | "docx-failure"
  | "empty";

export class ResumeParseError extends Error {
  readonly code: ResumeParseErrorCode;

  constructor(code: ResumeParseErrorCode, message: string) {
    super(message);
    this.name = "ResumeParseError";
    this.code = code;
  }
}

function normalizeExtractedText(text: string): string {
  return text.replace(/\u0000/g, "").replace(/\s+\n/g, "\n").trim();
}

async function extractPdfText(bytes: Uint8Array): Promise<string> {
  try {
    const { text } = await extractText(bytes, { mergePages: true });
    return text;
  } catch {
    throw new ResumeParseError(
      "unreadable-pdf",
      "We couldn't open that PDF. Try another file or paste the text.",
    );
  }
}

async function extractDocxText(bytes: Uint8Array): Promise<string> {
  try {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(bytes),
    });

    return result.value;
  } catch {
    throw new ResumeParseError(
      "docx-failure",
      "We couldn't read that Word file. Try a PDF or paste the text.",
    );
  }
}

export async function parseResumeDocument(input: {
  kind: ResumeFileKind;
  bytes: Uint8Array;
}): Promise<string> {
  const rawText =
    input.kind === "pdf"
      ? await extractPdfText(input.bytes)
      : await extractDocxText(input.bytes);

  const text = normalizeExtractedText(rawText).slice(
    0,
    MAX_RESUME_TEXT_CHARS,
  );

  if (text.length < MIN_RESUME_TEXT_CHARS) {
    throw new ResumeParseError(
      input.kind === "pdf" ? "image-only-pdf" : "empty",
      input.kind === "pdf"
        ? "We couldn't read text from this PDF. Try another file or paste your resume text instead."
        : "We could not find any resume text in that file.",
    );
  }

  return text;
}
