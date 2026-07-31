import {
    describe,
    expect,
    it,
  } from "vitest";
  
  import {
    normalizeProfileItemExtraction,
  } from "./normalize-extraction";
  
  describe(
    "normalizeProfileItemExtraction",
    () => {
      it("normalizes known skill aliases", () => {
        const result =
          normalizeProfileItemExtraction(
            "experience",
            {
              title: "Design project",
              description:
                "Designed a student dashboard.",
  
              skills: [
                {
                  name: "UX",
                  confidence: 0.9,
                  evidence:
                    "Designed the dashboard interaction.",
                },
                {
                  name: "Postgres",
                  confidence: 0.85,
                  evidence:
                    "Stored application data in Postgres.",
                },
              ],
            },
          );
  
        expect(result.skills).toEqual([
          {
            id: "user-experience",
            name: "User Experience",
            confidence: 0.9,
            evidence:
              "Designed the dashboard interaction.",
          },
          {
            id: "postgresql",
            name: "PostgreSQL",
            confidence: 0.85,
            evidence:
              "Stored application data in Postgres.",
          },
        ]);
      });
  
      it("creates stable IDs for unknown skills", () => {
        const result =
          normalizeProfileItemExtraction(
            "experience",
            {
              title: "Next.js project",
              description:
                "Built a web application.",
  
              skills: [
                {
                  name: "Next.js",
                  confidence: 0.95,
                  evidence:
                    "The project used Next.js.",
                },
              ],
            },
          );
  
        expect(result.skills[0]).toEqual({
          id: "next-js",
          name: "Next.js",
          confidence: 0.95,
          evidence:
            "The project used Next.js.",
        });
      });
  
      it("deduplicates equivalent skills", () => {
        const result =
          normalizeProfileItemExtraction(
            "experience",
            {
              title: "Frontend project",
              description:
                "Built an accessible interface.",
  
              skills: [
                {
                  name: "UX",
                  confidence: 0.7,
                  evidence:
                    "Created interface flows.",
                },
                {
                  name:
                    "User Experience Design",
                  confidence: 0.92,
                  evidence:
                    "Designed and tested user flows.",
                },
              ],
            },
          );
  
        expect(result.skills).toHaveLength(1);
  
        expect(result.skills[0]).toEqual({
          id: "user-experience",
          name: "User Experience",
          confidence: 0.92,
          evidence:
            "Designed and tested user flows.",
        });
      });
  
      it("sorts skills by confidence", () => {
        const result =
          normalizeProfileItemExtraction(
            "course",
            {
              title:
                "Full-stack development",
              description:
                "Built complete web applications.",
  
              skills: [
                {
                  name: "React",
                  confidence: 0.81,
                  evidence:
                    "Built React interfaces.",
                },
                {
                  name: "TypeScript",
                  confidence: 0.97,
                  evidence:
                    "Implemented the application in TypeScript.",
                },
              ],
            },
          );
  
        expect(
          result.skills.map(
            (skill) => skill.id,
          ),
        ).toEqual([
          "typescript",
          "react",
        ]);
      });
    },
  );