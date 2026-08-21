import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  DEMO_PATH,
  LANDING_PATH,
  LOGIN_PATH,
  WORKSPACE_PATH,
  getPostLoginPath,
  isAuthenticatedWorkspacePath,
  isPublicHtmlPath,
} from "@/lib/app-routes";

describe("public HTML routes", () => {
  it("treats landing, login, and demo as public", () => {
    expect(isPublicHtmlPath(LANDING_PATH)).toBe(true);
    expect(isPublicHtmlPath(LOGIN_PATH)).toBe(true);
    expect(isPublicHtmlPath(DEMO_PATH)).toBe(true);
  });

  it("keeps the authenticated workspace protected", () => {
    expect(isPublicHtmlPath(WORKSPACE_PATH)).toBe(false);
    expect(isAuthenticatedWorkspacePath(WORKSPACE_PATH)).toBe(true);
  });

  it("does not treat AI routes as public HTML", () => {
    expect(isPublicHtmlPath("/api/ai/extract-resume")).toBe(false);
    expect(isPublicHtmlPath("/api/ai/extract-opportunity")).toBe(false);
    expect(isPublicHtmlPath("/api/ai/extract-profile-item")).toBe(false);
  });
});

describe("authenticated navigation after / moved to landing", () => {
  it("sends signed-in users to /workspace, not /", () => {
    expect(getPostLoginPath()).toBe(WORKSPACE_PATH);
    expect(getPostLoginPath()).not.toBe(LANDING_PATH);
  });

  it("does not leave workspace-intended / navigation in auth or proxy files", () => {
    const files = [
      "src/features/auth/components/auth-form.tsx",
      "src/app/login/page.tsx",
      "src/lib/supabase/proxy.ts",
      "src/features/auth/components/account-menu.tsx",
      "src/app/workspace/page.tsx",
    ];

    for (const file of files) {
      const source = readFileSync(file, "utf8");

      expect(source).not.toMatch(/replace\(["']\/["']\)/);
      expect(source).not.toMatch(/redirect\(["']\/["']\)/);
      expect(source).not.toMatch(/pathname = ["']\/["']/);
    }
  });
});
