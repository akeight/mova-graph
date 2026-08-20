import type { OpportunityExtraction } from
  "../types/opportunity-what-if";
import type { OpportunityExtractionInput } from
  "../schemas/opportunity-extraction";

type ErrorBody = {
  error?: string;
};

async function readError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = (await response.json()) as ErrorBody;
    return body.error || fallback;
  } catch {
    return fallback;
  }
}

export async function extractOpportunitySource(
  input: OpportunityExtractionInput,
): Promise<OpportunityExtraction> {
  const response = await fetch("/api/ai/extract-opportunity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "Mova could not analyze that opportunity. Please try again.",
      ),
    );
  }

  return response.json() as Promise<OpportunityExtraction>;
}
