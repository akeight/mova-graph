import type { LucideIcon } from "lucide-react";

import {
  Compass,
  FlaskConical,
  LayoutDashboard,
  ListChecks,
  Map,
  UserRound,
} from "lucide-react";

export type WorkspaceView =
  | "dashboard"
  | "career-map"
  | "skill-gaps"
  | "next-steps"
  | "what-if"
  | "profile";

export const DEFAULT_WORKSPACE_VIEW: WorkspaceView = "dashboard";

export type WorkspaceNavItem = {
  view: WorkspaceView;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type WorkspaceNavGroup = {
  id: string;
  label: string | null;
  items: WorkspaceNavItem[];
};

export const workspaceNavGroups: WorkspaceNavGroup[] = [
  {
    id: "overview",
    label: null,
    items: [
      {
        view: "dashboard",
        label: "Dashboard",
        description: "Your current path at a glance",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "path",
    label: "Your path",
    items: [
      {
        view: "career-map",
        label: "Career Map",
        description: "See how your work connects to the role",
        icon: Map,
      },
      {
        view: "skill-gaps",
        label: "Skill Gaps",
        description: "Where you are covered and where gaps remain",
        icon: Compass,
      },
      {
        view: "next-steps",
        label: "Next Steps",
        description: "The moves that create the most progress",
        icon: ListChecks,
      },
      {
        view: "what-if",
        label: "What If?",
        description: "Preview how a move changes your readiness",
        icon: FlaskConical,
      },
    ],
  },
  {
    id: "profile",
    label: "Your profile",
    items: [
      {
        view: "profile",
        label: "Profile",
        description: "Edit your courses, experiences, and skills",
        icon: UserRound,
      },
    ],
  },
];

export const workspaceNavItems: WorkspaceNavItem[] =
  workspaceNavGroups.flatMap((group) => group.items);

export function getWorkspaceNavItem(
  view: WorkspaceView,
): WorkspaceNavItem {
  const item = workspaceNavItems.find(
    (navItem) => navItem.view === view,
  );

  if (!item) {
    throw new Error(
      `Unknown workspace view: ${view}`,
    );
  }

  return item;
}
