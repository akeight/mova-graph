import { describe, expect, it } from "vitest";

import type { EvidenceSkillDefinition } from "../types/evidence-skill";

import {
  expandEvidenceImplications,
  isPhraseGroundedInSource,
  isSkillGroundedInText,
  normalizeEvidenceNames,
  resolveEvidenceTerm,
} from "./normalize-evidence";

import { getEvidenceSkill } from "../data/evidence-skills";

function idsOf(names: string[]) {
  return normalizeEvidenceNames(names).map((skill) => skill.id);
}

describe("resolveEvidenceTerm", () => {
  it("resolves exact IDs, canonical names, and aliases", () => {
    expect(resolveEvidenceTerm("postgresql").direct).toMatchObject({
      id: "postgresql",
      method: "exact-id",
    });

    expect(resolveEvidenceTerm("PostgreSQL").direct).toMatchObject({
      id: "postgresql",
      method: "exact-name",
    });

    expect(resolveEvidenceTerm("Postgres").direct).toMatchObject({
      id: "postgresql",
      method: "alias",
    });
  });

  it("maps iOS and Android to platform capabilities, not languages", () => {
    expect(resolveEvidenceTerm("iOS").direct.id).toBe("ios-development");
    expect(resolveEvidenceTerm("Android").direct.id).toBe(
      "android-development",
    );
    expect(resolveEvidenceTerm("Swift").direct.id).toBe("swift");
    expect(resolveEvidenceTerm("Kotlin").direct.id).toBe("kotlin");
  });

  it("preserves unknown evidence without inventing a capability", () => {
    const result = resolveEvidenceTerm("AtlasFlow");

    expect(result.direct).toMatchObject({
      id: "atlasflow",
      name: "AtlasFlow",
      method: "unmapped",
    });
    expect(result.derived).toEqual([]);
  });

  it("leaves canonical internal IDs unchanged", () => {
    const result = resolveEvidenceTerm("api-integration");

    expect(result.direct.id).toBe("api-integration");
    expect(result.derived).toEqual([]);
  });

  it("does not map bare node, maui, or generic ASP.NET to Core", () => {
    expect(resolveEvidenceTerm("node").direct.id).not.toBe("nodejs");
    expect(resolveEvidenceTerm("maui").direct.id).not.toBe("dotnet-maui");
    expect(resolveEvidenceTerm("ASP.NET").direct.id).toBe("aspnet");
    expect(resolveEvidenceTerm("ASP.NET Core").direct.id).toBe(
      "aspnet-core",
    );
  });

  it("resolves C# to csharp instead of an unknown c slug", () => {
    expect(resolveEvidenceTerm("C#").direct).toMatchObject({
      id: "csharp",
      name: "C#",
    });
    expect(resolveEvidenceTerm("C").direct.id).not.toBe("csharp");
  });
});

describe("normalizeEvidenceNames", () => {
  it.each([
    ["Postgres", ["postgresql", "database-development"]],
    ["PostgreSQL", ["postgresql", "database-development"]],
    ["UX Design", ["user-experience"]],
    ["Next.js", ["nextjs", "react", "frontend-development"]],
    ["Vue", ["vue", "frontend-development"]],
    ["Angular", ["angular", "frontend-development"]],
    ["Svelte", ["svelte", "frontend-development"]],
    [".NET MAUI", ["dotnet-maui", "mobile-development"]],
    ["Flutter", ["flutter", "mobile-development"]],
    ["React Native", ["react-native", "mobile-development"]],
    ["SwiftUI", ["swiftui"]],
    ["iOS", ["ios-development", "mobile-development"]],
    ["Android", ["android-development", "mobile-development"]],
    ["MySQL", ["mysql", "database-development"]],
    ["SQL Server", ["sql-server", "database-development"]],
    ["Unit Testing", ["unit-testing", "software-testing"]],
    ["Automated Testing", ["automated-testing", "software-testing"]],
    ["xUnit", ["xunit", "software-testing"]],
    ["Vitest", ["vitest", "software-testing"]],
    ["C#", ["csharp"]],
    ["Express", ["express", "backend-development"]],
    ["FastAPI", ["fastapi", "backend-development", "api-development"]],
    ["SomeNewFramework", ["somenewframework"]],
  ])("normalizes %s", (input, expected) => {
    expect(idsOf([input])).toEqual(expected);
  });

  it("does not map Vue, Angular, or Svelte to React", () => {
    expect(idsOf(["Vue"])).not.toContain("react");
    expect(idsOf(["Angular"])).not.toContain("react");
    expect(idsOf(["Svelte"])).not.toContain("react");
  });

  it("does not infer Swift or Kotlin from platforms or MAUI", () => {
    expect(idsOf(["iOS"])).not.toContain("swift");
    expect(idsOf(["Android"])).not.toContain("kotlin");
    expect(idsOf([".NET MAUI"])).not.toContain("swift");
    expect(idsOf([".NET MAUI"])).not.toContain("kotlin");
    expect(idsOf([".NET MAUI"])).not.toContain("ios-development");
    expect(idsOf(["React Native"])).not.toContain("react");
    expect(idsOf(["SwiftUI"])).not.toContain("ios-development");
    expect(idsOf(["SwiftUI"])).not.toContain("mobile-development");
  });

  it("does not imply api-development from Express alone", () => {
    expect(idsOf(["Express"])).not.toContain("api-development");
  });

  it("deduplicates equivalent names", () => {
    expect(idsOf(["Postgres", "PostgreSQL"])).toEqual([
      "postgresql",
      "database-development",
    ]);
  });

  it("expands recursive implications exactly once", () => {
    const skills = normalizeEvidenceNames(["nextjs"]);

    expect(skills.map((skill) => skill.id)).toEqual([
      "nextjs",
      "react",
      "frontend-development",
    ]);
    expect(
      skills.filter((skill) => skill.id === "frontend-development"),
    ).toHaveLength(1);
  });

  it("lets direct evidence win over derived evidence", () => {
    const skills = normalizeEvidenceNames(["Next.js", "React"]);
    const react = skills.find((skill) => skill.id === "react");

    expect(react?.provenance).toBe("direct");
    expect(react?.method).not.toBe("derived");
  });
});

describe("expandEvidenceImplications", () => {
  it("terminates safely on a cyclic synthetic registry", () => {
    const cyclicSkills: EvidenceSkillDefinition[] = [
      {
        id: "a",
        name: "A",
        category: "technology",
        implies: ["b"],
      },
      {
        id: "b",
        name: "B",
        category: "technology",
        implies: ["a"],
      },
    ];

    expect(
      expandEvidenceImplications("a", "A", cyclicSkills).map(
        (skill) => skill.id,
      ),
    ).toEqual(["b"]);
  });
});

describe("source grounding helpers", () => {
  it("requires the source phrase to appear in the source text", () => {
    expect(
      isPhraseGroundedInSource(
        "AtlasFlow",
        "Built internal workflows using AtlasFlow.",
      ),
    ).toBe(true);

    expect(
      isPhraseGroundedInSource(
        "React",
        "Built internal workflows using AtlasFlow.",
      ),
    ).toBe(false);
  });

  it("does not treat English words as React, Express, or Swift", () => {
    const react = getEvidenceSkill("react");
    const express = getEvidenceSkill("express");
    const swift = getEvidenceSkill("swift");

    expect(react && isSkillGroundedInText(react, "I react quickly to user feedback.")).toBe(
      false,
    );
    expect(
      express &&
        isSkillGroundedInText(
          express,
          "I learned to express technical ideas clearly.",
        ),
    ).toBe(false);
    expect(
      swift &&
        isSkillGroundedInText(swift, "We needed a swift response to the issue."),
    ).toBe(false);
  });

  it("uses longest-match validation for compound technologies", () => {
    const react = getEvidenceSkill("react");
    const reactNative = getEvidenceSkill("react-native");
    const aspnet = getEvidenceSkill("aspnet");
    const aspnetCore = getEvidenceSkill("aspnet-core");

    expect(
      reactNative &&
        isSkillGroundedInText(reactNative, "Built a React Native app."),
    ).toBe(true);
    expect(
      react && isSkillGroundedInText(react, "Built a React Native app."),
    ).toBe(false);
    expect(
      aspnetCore &&
        isSkillGroundedInText(
          aspnetCore,
          "Implemented REST endpoints in ASP.NET Core.",
        ),
    ).toBe(true);
    expect(
      aspnet &&
        isSkillGroundedInText(
          aspnet,
          "Implemented REST endpoints in ASP.NET Core.",
        ),
    ).toBe(false);
  });

  it("does not independently invent evidence from a mention", () => {
    expect(idsOf(["We considered React but chose Vue."])).toEqual([
      "we-considered-react-but-chose-vue",
    ]);
  });
});
