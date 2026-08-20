"use client";

import { useState } from "react";

import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  FolderKanban,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getEvidenceSkillName } from "@/features/goals/data/evidence-skills";

import { addProfileItem } from "../services/profile-item-service";
import { addSelfReportedSkills } from
  "../services/profile-self-reported-skill-service";
import {
  contextualSkillIds,
  quickAddPrefillSkillIds,
  quickAddSkillContext,
  type QuickAddType,
} from "../types/profile-action";
import type {
  CourseProgress,
  ExperienceProgress,
  StudentProfile,
} from "../types/student-profile";
import { PROFILE_ITEM_DESCRIPTION_MAX } from "../constants";

type QuickAddEvidenceFormProps = {
  profile: StudentProfile;
  itemType?: QuickAddType;
  skillIds?: string[];
  onChange: (profile: StudentProfile) => void;
  onSelectType: (itemType: QuickAddType) => void;
  onOpenAiAssistant: () => void;
  onClose: () => void;
};

const typeOptions: Array<{
  type: QuickAddType;
  label: string;
  icon: typeof BookOpen;
}> = [
  { type: "experience", label: "Experience", icon: BriefcaseBusiness },
  { type: "project", label: "Project", icon: FolderKanban },
  { type: "course", label: "Course", icon: BookOpen },
  { type: "certification", label: "Certification", icon: Award },
  { type: "skill", label: "Skill", icon: Sparkles },
];

function evidenceNames(skillIds: string[] | undefined) {
  return contextualSkillIds(skillIds).map((skillId) =>
    getEvidenceSkillName(skillId),
  );
}

export function QuickAddEvidenceForm({
  profile,
  itemType,
  skillIds,
  onChange,
  onSelectType,
  onOpenAiAssistant,
  onClose,
}: QuickAddEvidenceFormProps) {
  const presetNames = evidenceNames(quickAddPrefillSkillIds(skillIds));
  const suggestionNames =
    quickAddSkillContext(skillIds) === "multiple"
      ? evidenceNames(skillIds)
      : [];

  if (!itemType) {
    return (
      <div className="space-y-4 px-6 pb-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Add a course, project, or listed skill without leaving this page.
        </p>

        <div className="grid gap-2">
          {typeOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Button
                key={option.type}
                type="button"
                variant="outline"
                className="justify-start"
                onClick={() => onSelectType(option.type)}
              >
                <Icon aria-hidden="true" />
                {option.label}
              </Button>
            );
          })}
        </div>

        <Button
          type="button"
          className="w-full"
          onClick={onOpenAiAssistant}
        >
          <WandSparkles aria-hidden="true" />
          Describe it with AI
        </Button>
      </div>
    );
  }

  if (itemType === "skill") {
    return (
      <SkillQuickAddForm
        profile={profile}
        presetName={presetNames[0]}
        suggestionNames={suggestionNames}
        onChange={onChange}
        onClose={onClose}
      />
    );
  }

  if (itemType === "course" || itemType === "certification") {
    return (
      <CourseQuickAddForm
        profile={profile}
        certification={itemType === "certification"}
        presetNames={presetNames}
        suggestionNames={suggestionNames}
        onChange={onChange}
        onClose={onClose}
      />
    );
  }

  return (
    <ExperienceQuickAddForm
      profile={profile}
      project={itemType === "project"}
      presetNames={presetNames}
      suggestionNames={suggestionNames}
      onChange={onChange}
      onClose={onClose}
    />
  );
}

function SkillQuickAddForm({
  profile,
  presetName,
  suggestionNames,
  onChange,
  onClose,
}: {
  profile: StudentProfile;
  presetName?: string;
  suggestionNames: string[];
  onChange: (profile: StudentProfile) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(presetName ?? "");

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    onChange(addSelfReportedSkills(profile, [name]));
  };

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      <div className="space-y-3 px-6 pb-4">
        <SuggestedEvidenceHint names={suggestionNames} />
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Skill</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="React"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
      </div>
      <FormActions
        disabled={!name.trim()}
        onCancel={onClose}
      />
    </form>
  );
}

function CourseQuickAddForm({
  profile,
  certification,
  presetNames,
  suggestionNames,
  onChange,
  onClose,
}: {
  profile: StudentProfile;
  certification: boolean;
  presetNames: string[];
  suggestionNames: string[];
  onChange: (profile: StudentProfile) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<CourseProgress>("completed");
  const [skillsText, setSkillsText] = useState(presetNames.join(", "));

  const handleSave = () => {
    const skillNames = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title.trim() || skillNames.length === 0) {
      return;
    }

    onChange(
      addProfileItem(profile, {
        kind: "course",
        title,
        description,
        status,
        skillNames,
        courseKind: certification ? "certification" : "course",
      }),
    );
  };

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <StatusSelect status={status} onChange={setStatus} />
        <EvidenceField
          value={skillsText}
          suggestionNames={suggestionNames}
          onChange={setSkillsText}
        />
      </div>
      <FormActions
        disabled={!title.trim() || !skillsText.trim()}
        onCancel={onClose}
      />
    </form>
  );
}

function ExperienceQuickAddForm({
  profile,
  project,
  presetNames,
  suggestionNames,
  onChange,
  onClose,
}: {
  profile: StudentProfile;
  project: boolean;
  presetNames: string[];
  suggestionNames: string[];
  onChange: (profile: StudentProfile) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ExperienceProgress>("completed");
  const [skillsText, setSkillsText] = useState(presetNames.join(", "));

  const handleSave = () => {
    const skillNames = skillsText
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (!title.trim() || skillNames.length === 0) {
      return;
    }

    onChange(
      addProfileItem(profile, {
        kind: "experience",
        title,
        description,
        status,
        skillNames,
        experienceKind: project ? "project" : "work",
        organization,
      }),
    );
  };

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        handleSave();
      }}
    >
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Organization</span>
          <input
            value={organization}
            onChange={(event) => setOrganization(event.target.value)}
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium">Description</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            maxLength={PROFILE_ITEM_DESCRIPTION_MAX}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
          />
        </label>
        <StatusSelect status={status} onChange={setStatus} />
        <EvidenceField
          value={skillsText}
          suggestionNames={suggestionNames}
          onChange={setSkillsText}
        />
      </div>
      <FormActions
        disabled={!title.trim() || !skillsText.trim()}
        onCancel={onClose}
      />
    </form>
  );
}

function StatusSelect({
  status,
  onChange,
}: {
  status: CourseProgress | ExperienceProgress;
  onChange: (status: CourseProgress & ExperienceProgress) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium">Status</span>
      <select
        value={status}
        onChange={(event) =>
          onChange(event.target.value as CourseProgress & ExperienceProgress)
        }
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      >
        <option value="completed">Completed</option>
        <option value="in-progress">In progress</option>
        <option value="planned">Planned</option>
      </select>
    </label>
  );
}

function SuggestedEvidenceHint({ names }: { names: string[] }) {
  if (names.length === 0) {
    return null;
  }

  return (
    <p className="text-xs leading-relaxed text-muted-foreground">
      Suggested evidence: {names.join(" · ")}
    </p>
  );
}

function EvidenceField({
  value,
  suggestionNames,
  onChange,
}: {
  value: string;
  suggestionNames: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <SuggestedEvidenceHint names={suggestionNames} />
      <label className="block space-y-1.5">
        <span className="text-xs font-medium">Evidence</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Skills, separated by commas"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>
    </div>
  );
}

function FormActions({
  disabled,
  onCancel,
}: {
  disabled: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 border-t px-6 py-4">
      <Button type="submit" className="flex-1" disabled={disabled}>
        Save
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
