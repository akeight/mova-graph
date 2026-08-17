import type { EvidenceSkillDefinition } from "../types/evidence-skill";
import type {
  EvidenceNormalizationMethod,
  NormalizedEvidenceResult,
  NormalizedEvidenceSkill,
} from "../types/normalized-evidence";

import {
  buildEvidenceLookupMap,
  createEvidenceLookupKey,
  evidenceSkills,
  getEvidenceImplicationTargets,
  getEvidenceSkillName,
} from "../data/evidence-skills";

const evidenceLookup = buildEvidenceLookupMap();

const ambiguousEnglishTokens = new Set([
  "react",
  "express",
  "swift",
]);

export function createUnmappedEvidenceId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createDirectSkill(
  skill: EvidenceSkillDefinition,
  sourcePhrase: string,
  method: Exclude<EvidenceNormalizationMethod, "derived" | "semantic" | "unmapped">,
): NormalizedEvidenceSkill {
  return {
    id: skill.id,
    name: skill.name,
    sourcePhrase,
    method,
    provenance: "direct",
    category: skill.category,
  };
}

export function resolveEvidenceTerm(
  sourcePhrase: string,
): NormalizedEvidenceResult {
  const trimmed = sourcePhrase.trim();
  const lookupKey = createEvidenceLookupKey(trimmed);

  if (!lookupKey) {
    const id = createUnmappedEvidenceId(trimmed);

    return {
      sourcePhrase: trimmed,
      direct: {
        id,
        name: trimmed,
        sourcePhrase: trimmed,
        method: "unmapped",
        provenance: "direct",
      },
      derived: [],
    };
  }

  const registrySkill = evidenceLookup.get(lookupKey);

  if (!registrySkill) {
    const id = createUnmappedEvidenceId(trimmed);

    return {
      sourcePhrase: trimmed,
      direct: {
        id,
        name: trimmed,
        sourcePhrase: trimmed,
        method: "unmapped",
        provenance: "direct",
      },
      derived: [],
    };
  }

  let method: "exact-id" | "exact-name" | "alias" = "alias";

  if (trimmed === registrySkill.id) {
    method = "exact-id";
  } else if (createEvidenceLookupKey(registrySkill.name) === lookupKey) {
    method = "exact-name";
  }

  return {
    sourcePhrase: trimmed,
    direct: createDirectSkill(registrySkill, trimmed, method),
    derived: expandEvidenceImplications(registrySkill.id, trimmed),
  };
}

export function expandEvidenceImplications(
  skillId: string,
  sourcePhrase = "",
  skills: EvidenceSkillDefinition[] = evidenceSkills,
): NormalizedEvidenceSkill[] {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const derived: NormalizedEvidenceSkill[] = [];
  const visited = new Set<string>([skillId]);
  const queue: Array<{ id: string; from: string }> = [];

  const origin = byId.get(skillId);

  for (const target of origin ? getEvidenceImplicationTargets(origin) : []) {
    if (!visited.has(target) && byId.has(target)) {
      visited.add(target);
      queue.push({ id: target, from: skillId });
    }
  }

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    const skill = byId.get(current.id);

    if (!skill) {
      continue;
    }

    derived.push({
      id: skill.id,
      name: skill.name,
      sourcePhrase,
      method: "derived",
      provenance: "derived",
      category: skill.category,
      derivedFromSkillId: current.from,
    });

    for (const target of getEvidenceImplicationTargets(skill)) {
      if (!visited.has(target) && byId.has(target)) {
        visited.add(target);
        queue.push({ id: target, from: skill.id });
      }
    }
  }

  return derived;
}

function collectNormalizedSkills(
  results: NormalizedEvidenceResult[],
): NormalizedEvidenceSkill[] {
  const byId = new Map<string, NormalizedEvidenceSkill>();

  const consider = (skill: NormalizedEvidenceSkill) => {
    const existing = byId.get(skill.id);

    if (!existing) {
      byId.set(skill.id, skill);
      return;
    }

    if (existing.provenance === "direct" && skill.provenance === "derived") {
      return;
    }

    if (existing.provenance === "derived" && skill.provenance === "direct") {
      byId.set(skill.id, skill);
    }
  };

  for (const result of results) {
    if (result.direct.id) {
      consider(result.direct);
    }
  }

  for (const result of results) {
    for (const derived of result.derived) {
      consider(derived);
    }
  }

  const directs = results
    .map((result) => result.direct)
    .filter((skill) => byId.get(skill.id)?.provenance === "direct");

  const uniqueDirects: NormalizedEvidenceSkill[] = [];
  const seenDirects = new Set<string>();

  for (const skill of directs) {
    if (!seenDirects.has(skill.id)) {
      seenDirects.add(skill.id);
      uniqueDirects.push(byId.get(skill.id) ?? skill);
    }
  }

  const derived: NormalizedEvidenceSkill[] = [];
  const seenDerived = new Set<string>(seenDirects);

  for (const result of results) {
    for (const skill of result.derived) {
      const chosen = byId.get(skill.id);

      if (!chosen || chosen.provenance !== "derived" || seenDerived.has(skill.id)) {
        continue;
      }

      seenDerived.add(skill.id);
      derived.push(chosen);
    }
  }

  return [...uniqueDirects, ...derived];
}

export function normalizeEvidenceNames(
  sourceNames: string[],
): NormalizedEvidenceSkill[] {
  const results = sourceNames
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => resolveEvidenceTerm(name));

  return collectNormalizedSkills(results);
}

export function isPhraseGroundedInSource(
  sourcePhrase: string,
  sourceText: string,
): boolean {
  const phraseKey = createEvidenceLookupKey(sourcePhrase);
  const sourceKey = createEvidenceLookupKey(sourceText);

  if (!phraseKey || !sourceKey) {
    return false;
  }

  return (
    sourceKey === phraseKey ||
    sourceKey.startsWith(`${phraseKey} `) ||
    sourceKey.endsWith(` ${phraseKey}`) ||
    sourceKey.includes(` ${phraseKey} `)
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requiresCaseSensitiveGrounding(phrase: string): boolean {
  const key = createEvidenceLookupKey(phrase);
  return ambiguousEnglishTokens.has(key) && !key.includes(" ");
}

function findPhraseSpans(
  text: string,
  phrase: string,
): Array<{ start: number; end: number }> {
  if (!phrase.trim()) {
    return [];
  }

  const flags = requiresCaseSensitiveGrounding(phrase) ? "g" : "gi";
  const pattern = new RegExp(
    `(?<![A-Za-z0-9])${escapeRegExp(phrase).replace(/\s+/g, "\\s+")}(?![A-Za-z0-9])`,
    flags,
  );

  return [...text.matchAll(pattern)].map((match) => ({
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

type CatalogPhrase = {
  skillId: string;
  phrase: string;
};

function collectCatalogPhrases(): CatalogPhrase[] {
  const phrases: CatalogPhrase[] = [];

  for (const skill of evidenceSkills) {
    phrases.push({ skillId: skill.id, phrase: skill.name });

    for (const alias of skill.aliases ?? []) {
      phrases.push({ skillId: skill.id, phrase: alias });
    }
  }

  return phrases.sort((left, right) => right.phrase.length - left.phrase.length);
}

const catalogPhrases = collectCatalogPhrases();

export function isSkillGroundedInText(
  skill: EvidenceSkillDefinition,
  text: string,
): boolean {
  const occupied = new Array(text.length).fill(false);

  for (const phrase of catalogPhrases) {
    const spans = findPhraseSpans(text, phrase.phrase);

    for (const span of spans) {
      const overlaps = occupied.slice(span.start, span.end).some(Boolean);

      if (overlaps) {
        continue;
      }

      for (let index = span.start; index < span.end; index += 1) {
        occupied[index] = true;
      }

      if (phrase.skillId === skill.id) {
        return true;
      }
    }
  }

  return false;
}

export function toStudentSkills(
  normalized: NormalizedEvidenceSkill[],
): Array<{ id: string; name: string }> {
  return normalized.map((skill) => ({
    id: skill.id,
    name: skill.name || getEvidenceSkillName(skill.id),
  }));
}
