import { describe, expect, it } from "vitest";

import { MAX_RESUME_FILE_BYTES } from "../constants";

import { validateResumeFile } from "./validate-resume-file";

const pdfBytes = Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);
const docxBytes = Uint8Array.from([0x50, 0x4b, 0x03, 0x04, 0x00]);

describe("validateResumeFile", () => {
  it("accepts a PDF with matching magic bytes", () => {
    expect(
      validateResumeFile({
        filename: "resume.pdf",
        mimeType: "application/pdf",
        bytes: pdfBytes,
      }),
    ).toEqual({ ok: true, kind: "pdf" });
  });

  it("accepts a DOCX with a ZIP header", () => {
    expect(
      validateResumeFile({
        filename: "resume.docx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        bytes: docxBytes,
      }),
    ).toEqual({ ok: true, kind: "docx" });
  });

  it("rejects unsupported extensions", () => {
    const result = validateResumeFile({
      filename: "resume.png",
      mimeType: "image/png",
      bytes: pdfBytes,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("unsupported-type");
    }
  });

  it("rejects files that exceed the size limit", () => {
    const result = validateResumeFile({
      filename: "resume.pdf",
      mimeType: "application/pdf",
      bytes: new Uint8Array(MAX_RESUME_FILE_BYTES + 1),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("too-large");
    }
  });

  it("rejects empty files", () => {
    const result = validateResumeFile({
      filename: "resume.pdf",
      mimeType: "application/pdf",
      bytes: new Uint8Array(),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("empty");
    }
  });

  it("rejects a .pdf filename without PDF magic bytes", () => {
    const result = validateResumeFile({
      filename: "resume.pdf",
      mimeType: "application/pdf",
      bytes: docxBytes,
    });

    expect(result.ok).toBe(false);
  });
});
