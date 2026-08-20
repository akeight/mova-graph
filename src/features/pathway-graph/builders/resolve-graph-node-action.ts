import { EVIDENCE_PACKAGE_EXPERIENCE_PREFIX } from
  "@/features/student-profile/services/apply-evidence-package";

import type { MovaNode } from "../types/graph";

export type GraphNodeAction =
  | {
      type: "edit-activity";
      itemKind: "course" | "experience";
      itemId: string;
    }
  | {
      type: "manage-skill-evidence";
      skillId: string;
    }
  | {
      type: "navigate";
      view: "skill-gaps" | "next-steps";
    }
  | {
      type: "none";
    };

export function resolveGraphNodeAction(
  node: Pick<MovaNode, "data">,
): GraphNodeAction {
  const source = node.data.source;

  if (!source) {
    return { type: "none" };
  }

  if (source.kind === "course" || source.kind === "experience") {
    if (
      source.kind === "experience" &&
      source.itemId.startsWith(`${EVIDENCE_PACKAGE_EXPERIENCE_PREFIX}-`)
    ) {
      return { type: "none" };
    }

    return {
      type: "edit-activity",
      itemKind: source.kind,
      itemId: source.itemId,
    };
  }

  if (source.kind === "skill") {
    return {
      type: "manage-skill-evidence",
      skillId: source.skillId,
    };
  }

  if (source.kind === "competency") {
    return {
      type: "navigate",
      view: "skill-gaps",
    };
  }

  if (source.kind === "recommendation") {
    return {
      type: "navigate",
      view: "next-steps",
    };
  }

  return { type: "none" };
}
