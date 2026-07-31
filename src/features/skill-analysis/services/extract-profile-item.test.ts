import {
    describe,
    expect,
    it,
    vi,
  } from "vitest";
  
  import {
    extractProfileItem,
  } from "./extract-profile-item";
  
  describe("extractProfileItem", () => {
    it("normalizes structured AI output", async () => {
      const generate = vi.fn(
        async () => ({
          title:
            "Internship Tracking Platform",
  
          description:
            "Built a full-stack application for tracking internship applications.",
  
          skills: [
            {
              name: "TypeScript",
              confidence: 0.98,
              evidence:
                "The application was implemented in TypeScript.",
            },
            {
              name: "Postgres",
              confidence: 0.9,
              evidence:
                "Application records were stored in Postgres.",
            },
          ],
        }),
      );
  
      const result =
        await extractProfileItem(
          {
            kind: "experience",
            text: [
              "I built an internship",
              "tracking platform using",
              "TypeScript and Postgres.",
            ].join(" "),
          },
          generate,
        );
  
      expect(generate).toHaveBeenCalledOnce();
  
      expect(result).toEqual({
        kind: "experience",
  
        title:
          "Internship Tracking Platform",
  
        description:
          "Built a full-stack application for tracking internship applications.",
  
        skills: [
          {
            id: "typescript",
            name: "TypeScript",
            confidence: 0.98,
            evidence:
              "The application was implemented in TypeScript.",
          },
          {
            id: "postgresql",
            name: "PostgreSQL",
            confidence: 0.9,
            evidence:
              "Application records were stored in Postgres.",
          },
        ],
      });
    });
  });