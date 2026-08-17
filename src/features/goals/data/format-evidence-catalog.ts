import { evidenceSkills } from "./evidence-skills";

export function formatEvidenceCatalogForPrompt(): string {
  return evidenceSkills
    .map((skill) => {
      const description = skill.description
        ? `\n${skill.description}`
        : "";

      return `${skill.id} — ${skill.name} [${skill.category}]${description}`;
    })
    .join("\n\n");
}
