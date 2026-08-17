import { NextResponse } from "next/server";

import { getAuthenticatedUser } from
  "@/features/auth/services/session";

import { MAX_RESUME_FILE_BYTES } from
  "@/features/resume-import/constants";
import { parseResumeDocument, ResumeParseError } from
  "@/features/resume-import/services/parse-resume-document";
import { sanitizeResumeFilename } from
  "@/features/resume-import/services/sanitize-resume-filename";
import { validateResumeFile } from
  "@/features/resume-import/services/validate-resume-file";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "Upload a PDF or DOCX, or paste your resume text instead.",
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        error:
          "Upload a PDF or DOCX, or paste your resume text instead.",
      },
      { status: 400 },
    );
  }

  if (file.size > MAX_RESUME_FILE_BYTES) {
    return NextResponse.json(
      {
        error:
          "That file is too large. Use a file under 2 MB, or paste the text.",
        code: "too-large",
      },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const displayName = sanitizeResumeFilename(file.name);
  const validation = validateResumeFile({
    filename: file.name,
    mimeType: file.type,
    bytes,
  });

  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error.message, code: validation.error.code },
      { status: 400 },
    );
  }

  try {
    const text = await parseResumeDocument({
      kind: validation.kind,
      bytes,
    });

    return NextResponse.json({
      displayName,
      characterCount: text.length,
      text,
    });
  } catch (error) {
    if (error instanceof ResumeParseError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 },
      );
    }

    console.error("Resume parsing failed:", error);

    return NextResponse.json(
      {
        error:
          "We couldn't read that file. Try another file or paste your resume text.",
      },
      { status: 500 },
    );
  }
}
