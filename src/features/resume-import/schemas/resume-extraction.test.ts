import { describe, expect, it } from "vitest";
import { Output } from "ai";

import { rawResumeExtractionSchema } from "./resume-extraction";

function assertOpenAiRequiredKeys(schema: unknown, path = "$") {
  if (!schema || typeof schema !== "object") {
    return;
  }

  const node = schema as Record<string, unknown>;

  if (node.properties && typeof node.properties === "object") {
    const keys = Object.keys(node.properties as object).sort();
    const required = Array.isArray(node.required)
      ? [...(node.required as string[])].sort()
      : [];

    expect(required, `${path} required keys`).toEqual(keys);

    for (const [key, value] of Object.entries(
      node.properties as Record<string, unknown>,
    )) {
      assertOpenAiRequiredKeys(value, `${path}.${key}`);
    }
  }

  if ("items" in node) {
    assertOpenAiRequiredKeys(node.items, `${path}[]`);
  }

  for (const combiner of ["anyOf", "oneOf", "allOf"] as const) {
    const list = node[combiner];

    if (Array.isArray(list)) {
      list.forEach((entry, index) => {
        assertOpenAiRequiredKeys(entry, `${path}.${combiner}[${index}]`);
      });
    }
  }

  for (const defsKey of ["$defs", "definitions"] as const) {
    const defs = node[defsKey];

    if (defs && typeof defs === "object") {
      for (const [key, value] of Object.entries(
        defs as Record<string, unknown>,
      )) {
        assertOpenAiRequiredKeys(value, `${path}.${defsKey}.${key}`);
      }
    }
  }
}

describe("rawResumeExtractionSchema OpenAI compatibility", () => {
  it("lists every object property in required for Output.object", async () => {
    const output = Output.object({
      name: "MovaResumeExtraction",
      description:
        "Structured profile draft extracted from one student resume.",
      schema: rawResumeExtractionSchema,
    });

    const format = await output.responseFormat;

    expect(format).toBeDefined();
    expect(format?.type).toBe("json");

    if (!format || format.type !== "json") {
      throw new Error("Expected JSON response format");
    }

    assertOpenAiRequiredKeys(format.schema);
  });
});
