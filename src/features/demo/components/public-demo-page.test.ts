import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public demo workspace contract", () => {
  const source = readFileSync(
    new URL("../components/public-demo-page.tsx", import.meta.url),
    "utf8",
  );

  it("keeps persistence off and defaults the demo career to Full-Stack", () => {
    expect(source).toContain("persistenceEnabled={false}");
    expect(source).toContain("initialSelectedRoleId={DEMO_DEFAULT_CAREER_ROLE_ID}");
  });
});
