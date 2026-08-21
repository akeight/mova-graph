import { describe, expect, it } from "vitest";

import {
  DEMO_OPPORTUNITY_EXTRACTION,
  DEMO_OPPORTUNITY_TEXT,
} from "./demo-opportunity";

describe("DEMO_OPPORTUNITY_EXTRACTION", () => {
  it("keeps a Full-Stack-compatible production-delivery internship with only deployment", () => {
    expect(DEMO_OPPORTUNITY_EXTRACTION.title).toBe(
      "Software Engineering Internship — Production Delivery",
    );
    expect(DEMO_OPPORTUNITY_TEXT).toContain("production releases");
    expect(DEMO_OPPORTUNITY_TEXT).toContain("deployment and release pipelines");
    expect(
      DEMO_OPPORTUNITY_EXTRACTION.skills
        .filter((skill) => skill.provenance !== "derived")
        .map((skill) => skill.id),
    ).toEqual(["deployment"]);
  });
});
