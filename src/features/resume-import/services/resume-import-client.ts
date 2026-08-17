import type { ResumeImportDraft } from "../types/resume-import";

type ErrorBody = {
  error?: string;
};

async function readError(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody;
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function parseResumeFile(file: File): Promise<{
  displayName: string;
  text: string;
}> {
  const body = new FormData();
  body.set("file", file);

  const response = await fetch("/api/resume/parse", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "We couldn't read that file. Try another file or paste your resume text.",
      ),
    );
  }

  return response.json() as Promise<{ displayName: string; text: string }>;
}

export async function extractResumeSource(input: {
  sourceId: string;
  displayName: string;
  text: string;
}): Promise<ResumeImportDraft> {
  const response = await fetch("/api/ai/extract-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Mova could not analyze that resume. Please try again.",
      ),
    );
  }

  return response.json() as Promise<ResumeImportDraft>;
}
