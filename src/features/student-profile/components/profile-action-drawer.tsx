"use client";

import { getEvidenceSkillName } from "@/features/goals/data/evidence-skills";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  getProfileItemSkillNames,
  removeProfileItem,
  updateProfileItem,
} from
  "../services/profile-item-service";
import type { ProfileAction, QuickAddType } from "../types/profile-action";
import type {
  CourseProgress,
  ExperienceProgress,
  StudentProfile,
} from "../types/student-profile";
import {
  profileItemStatusLabel,
  profileItemTypeLabel,
} from "../utils/profile-item-label";

import {
  EditableProfileItemCard,
  type ProfileItemDraft,
} from "./editable-profile-item-card";
import { ManageSkillEvidenceForm } from "./manage-skill-evidence-form";
import { QuickAddEvidenceForm } from "./quick-add-evidence-form";

type ProfileActionDrawerProps = {
  action: ProfileAction | null;
  profile: StudentProfile;
  onProfileChange: (profile: StudentProfile) => void;
  onActionChange: (action: ProfileAction | null) => void;
  onOpenAiAssistant: () => void;
};

function drawerCopy(action: ProfileAction | null, profile: StudentProfile) {
  if (!action) {
    return {
      title: "Add evidence",
      description: "Add or update evidence in your Mova profile.",
    };
  }

  if (action.mode === "quick-add") {
    const names = (action.skillIds ?? []).map((skillId) =>
      getEvidenceSkillName(skillId),
    );

    if (names.length === 1) {
      return {
        title: `Add evidence for ${names[0]}`,
        description: "Link this evidence to a new profile item.",
      };
    }

    if (names.length > 1) {
      return {
        title: "Add evidence",
        description: `Suggested evidence: ${names.join(", ")}.`,
      };
    }

    return {
      title: "Add evidence",
      description: "Add a course, project, experience, certification, or skill.",
    };
  }

  if (action.mode === "manage-skill-evidence") {
    const skillName =
      profile.skills.find((skill) => skill.id === action.skillId)?.name ??
      getEvidenceSkillName(action.skillId);

    return {
      title:
        action.intent === "add"
          ? `Add evidence for ${skillName}`
          : `Manage evidence`,
      description: skillName,
    };
  }

  const item =
    action.itemKind === "course"
      ? profile.courses.find((course) => course.id === action.itemId)
      : profile.experiences.find(
          (experience) => experience.id === action.itemId,
        );

  return {
    title: item?.title ?? "Activity",
    description: item
      ? `${profileItemTypeLabel(action.itemKind, item)} · ${profileItemStatusLabel(item.status)}`
      : "This activity is no longer in your profile.",
  };
}

export function ProfileActionDrawer({
  action,
  profile,
  onProfileChange,
  onActionChange,
  onOpenAiAssistant,
}: ProfileActionDrawerProps) {
  const copy = drawerCopy(action, profile);
  const open = action !== null;

  const close = () => onActionChange(null);

  const handleQuickAddSaved = (nextProfile: StudentProfile) => {
    onProfileChange(nextProfile);

    if (action?.mode === "quick-add" && action.returnTo) {
      onActionChange(action.returnTo);
      return;
    }

    close();
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>{copy.title}</SheetTitle>
          <SheetDescription>{copy.description}</SheetDescription>
        </SheetHeader>

        {action?.mode === "quick-add" ? (
          <QuickAddEvidenceForm
            profile={profile}
            itemType={action.itemType}
            skillIds={action.skillIds}
            onChange={handleQuickAddSaved}
            onSelectType={(itemType: QuickAddType) =>
              onActionChange({
                ...action,
                itemType,
              })
            }
            onOpenAiAssistant={onOpenAiAssistant}
            onClose={close}
          />
        ) : null}

        {action?.mode === "manage-skill-evidence" ? (
          <ManageSkillEvidenceForm
            profile={profile}
            skillId={action.skillId}
            intent={action.intent}
            onChange={onProfileChange}
            onAddNew={() =>
              onActionChange({
                mode: "quick-add",
                skillIds: [action.skillId],
                returnTo: {
                  mode: "manage-skill-evidence",
                  skillId: action.skillId,
                  intent: action.intent,
                },
              })
            }
            onClose={close}
          />
        ) : null}

        {action?.mode === "edit-activity" ? (
          <EditActivityPanel
            profile={profile}
            itemKind={action.itemKind}
            itemId={action.itemId}
            onProfileChange={onProfileChange}
            onClose={close}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EditActivityPanel({
  profile,
  itemKind,
  itemId,
  onProfileChange,
  onClose,
}: {
  profile: StudentProfile;
  itemKind: "course" | "experience";
  itemId: string;
  onProfileChange: (profile: StudentProfile) => void;
  onClose: () => void;
}) {
  const item =
    itemKind === "course"
      ? profile.courses.find((course) => course.id === itemId)
      : profile.experiences.find((experience) => experience.id === itemId);

  if (!item) {
    return (
      <p className="px-6 text-sm text-muted-foreground">
        This activity is no longer in your profile.
      </p>
    );
  }

  const handleSave = (draft: ProfileItemDraft) => {
    if (itemKind === "course") {
      onProfileChange(
        updateProfileItem(profile, {
          kind: "course",
          itemId,
          title: draft.title,
          description: draft.description,
          status: draft.status as CourseProgress,
          skillNames: draft.skillNames,
        }),
      );
    } else {
      onProfileChange(
        updateProfileItem(profile, {
          kind: "experience",
          itemId,
          title: draft.title,
          description: draft.description,
          status: draft.status as ExperienceProgress,
          skillNames: draft.skillNames,
          organization: draft.organization,
          startDate: draft.startDate,
          endDate: draft.endDate,
        }),
      );
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
      <EditableProfileItemCard
        kind={itemKind}
        item={item}
        skillNames={getProfileItemSkillNames(profile, item.skillIds)}
        startInEditMode
        onSave={handleSave}
        onDelete={() => {
          onProfileChange(removeProfileItem(profile, itemKind, itemId));
          onClose();
        }}
      />
    </div>
  );
}
