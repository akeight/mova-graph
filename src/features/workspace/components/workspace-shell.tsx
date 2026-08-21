"use client";

import { useState, type ReactNode } from "react";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AccountMenu } from "@/features/auth/components/account-menu";
import { WorkspaceSaveStatus } from "@/features/persistence/components/workspace-save-status";
import type { WorkspaceSaveStatus as WorkspaceSaveStatusValue } from "@/features/persistence/types/workspace";

import {
  getWorkspaceNavItem,
  type WorkspaceView,
} from "../types/workspace-view";

import { WorkspaceSidebar } from "./workspace-sidebar";
import { ThemeToggle } from "./theme-toggle";

type WorkspaceShellProps = {
  activeView: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  saveStatus: WorkspaceSaveStatusValue;
  lastSavedAt: Date | null;
  saveError: string | null;
  userEmail: string | null;
  accountVariant?: "authenticated" | "demo";
  showSaveStatus?: boolean;
  children: ReactNode;
};

export function WorkspaceShell({
  activeView,
  onNavigate,
  saveStatus,
  lastSavedAt,
  saveError,
  userEmail,
  accountVariant = "authenticated",
  showSaveStatus = true,
  children,
}: WorkspaceShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] =
    useState(false);

  const activeItem = getWorkspaceNavItem(activeView);

  const handleNavigate = (view: WorkspaceView) => {
    onNavigate(view);
    setIsMobileNavOpen(false);
  };

  const saveStatusNode = showSaveStatus ? (
    <WorkspaceSaveStatus
      status={saveStatus}
      lastSavedAt={lastSavedAt}
      error={saveError}
    />
  ) : null;

  const accountNode = (
    <AccountMenu userEmail={userEmail} variant={accountVariant} />
  );

  return (
    <div className="min-h-dvh bg-muted/30 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <WorkspaceSidebar
          activeView={activeView}
          onNavigate={handleNavigate}
          className="flex-1"
        />

        <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
          {saveStatusNode}
          {accountNode}
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 lg:hidden">
          <Sheet
            open={isMobileNavOpen}
            onOpenChange={setIsMobileNavOpen}
          >
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Open navigation"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-72 gap-0 bg-sidebar p-0"
            >
              <SheetTitle className="sr-only">
                Workspace navigation
              </SheetTitle>

              <SheetDescription className="sr-only">
                Move between the dashboard, your path, and
                your profile.
              </SheetDescription>

              <WorkspaceSidebar
                activeView={activeView}
                onNavigate={handleNavigate}
              />

              <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
                {saveStatusNode}
                {accountNode}
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>

          <p className="text-sm font-semibold text-foreground">
            {activeItem.label}
          </p>

          <span className="text-lg font-bold tracking-tight text-foreground">
            Mova
          </span>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
