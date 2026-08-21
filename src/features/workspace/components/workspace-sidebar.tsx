"use client";

import { cn } from "@/lib/utils";

import {
  workspaceNavGroups,
  type WorkspaceView,
} from "../types/workspace-view";

type WorkspaceSidebarProps = {
  activeView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  className?: string;
};

export function WorkspaceSidebar({
  activeView,
  onNavigate,
  className,
}: WorkspaceSidebarProps) {
  return (
    <nav
      aria-label="Workspace"
      className={cn(
        "flex h-full flex-col gap-6 px-4 py-6",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-plum)] font-wordmark text-sm font-bold text-primary-foreground">
          M
        </span>

        <span className="font-wordmark text-xl text-foreground">
          Mova
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-6">
        {workspaceNavGroups.map((group) => (
          <div key={group.id} className="space-y-1.5">
            {group.label ? (
              <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {group.label}
              </p>
            ) : null}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  item.view === activeView;

                const Icon = item.icon;

                return (
                  <li key={item.view}>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate(item.view)
                      }
                      aria-current={
                        isActive
                          ? "page"
                          : undefined
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-foreground",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                        aria-hidden="true"
                      />

                      <span className="truncate">
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
