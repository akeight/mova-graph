"use client";

import { useMemo, useState } from "react";

import { BookOpen, BriefcaseBusiness, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getEvidenceSkillName } from "@/features/goals/data/evidence-skills";

import {
  linkSkillToProfileItem,
  unlinkSkillFromProfileItem,
} from "../services/link-skill-to-profile-item";
import type { StudentProfile } from "../types/student-profile";
import {
  profileItemStatusLabel,
  profileItemTypeLabel,
} from "../utils/profile-item-label";

type ManageSkillEvidenceFormProps = {
  profile: StudentProfile;
  skillId: string;
  intent?: "add" | "manage";
  onChange: (profile: StudentProfile) => void;
  onAddNew: () => void;
  onClose: () => void;
};

function itemKey(kind: "course" | "experience", itemId: string) {
  return `${kind}:${itemId}`;
}

export function ManageSkillEvidenceForm({
  profile,
  skillId,
  intent = "manage",
  onChange,
  onAddNew,
  onClose,
}: ManageSkillEvidenceFormProps) {
  const skillName = useMemo(
    () =>
      profile.skills.find((skill) => skill.id === skillId)?.name ??
      getEvidenceSkillName(skillId),
    [profile.skills, skillId],
  );

  const activities = useMemo(
    () => [
      ...profile.courses.map((course) => ({
        kind: "course" as const,
        item: course,
        linked: course.skillIds.includes(skillId),
      })),
      ...profile.experiences.map((experience) => ({
        kind: "experience" as const,
        item: experience,
        linked: experience.skillIds.includes(skillId),
      })),
    ],
    [profile.courses, profile.experiences, skillId],
  );

  const [selectedKeys, setSelectedKeys] = useState(
    () =>
      new Set(
        activities
          .filter((activity) => activity.linked)
          .map((activity) => itemKey(activity.kind, activity.item.id)),
      ),
  );

  const toggle = (kind: "course" | "experience", itemId: string) => {
    const key = itemKey(kind, itemId);

    setSelectedKeys((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

  const handleSave = () => {
    let nextProfile = profile;

    for (const activity of activities) {
      const key = itemKey(activity.kind, activity.item.id);
      const selected = selectedKeys.has(key);
      const ref = {
        kind: activity.kind,
        itemId: activity.item.id,
      };

      if (selected && !activity.linked) {
        nextProfile = linkSkillToProfileItem(nextProfile, skillId, ref);
      }

      if (!selected && activity.linked) {
        nextProfile = unlinkSkillFromProfileItem(nextProfile, skillId, ref);
      }
    }

    if (nextProfile !== profile) {
      onChange(nextProfile);
    }

    onClose();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-4">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {intent === "add"
            ? `Link existing work to ${skillName}, or add new evidence.`
            : `Choose which courses and experiences used ${skillName}.`}
        </p>

        {activities.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You do not have any profile activities yet.
            </p>
          </div>
        ) : (
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium">Link existing evidence</legend>

            {activities.map((activity) => {
              const checked = selectedKeys.has(
                itemKey(activity.kind, activity.item.id),
              );
              const Icon =
                activity.kind === "course" ? BookOpen : BriefcaseBusiness;

              return (
                <label
                  key={itemKey(activity.kind, activity.item.id)}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-3"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={() =>
                      toggle(activity.kind, activity.item.id)
                    }
                    aria-label={`Link ${skillName} to ${activity.item.title}`}
                  />
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {activity.item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {profileItemTypeLabel(activity.kind, activity.item)}
                      {" · "}
                      {profileItemStatusLabel(activity.item.status)}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onAddNew}
        >
          <Plus aria-hidden="true" />
          Add new evidence
        </Button>
      </div>

      <div className="flex gap-2 border-t px-6 py-4">
        <Button type="button" className="flex-1" onClick={handleSave}>
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
