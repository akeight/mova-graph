"use client";

import { Check, Target } from "lucide-react";

import { cn } from "@/lib/utils";

import type { CareerRole } from "../types/career-role";

type CareerRoleSelectorProps = {
  roles: CareerRole[];
  selectedRoleId: string;
  onSelect: (roleId: string) => void;
};

export function CareerRoleSelector({
  roles,
  selectedRoleId,
  onSelect,
}: CareerRoleSelectorProps) {
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ??
    roles[0];

  const requiredSkills = selectedRole.requirements.filter(
    (requirement) => requirement.importance === "required",
  );

  const preferredSkills = selectedRole.requirements.filter(
    (requirement) => requirement.importance === "preferred",
  );

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
          <Target className="h-5 w-5" aria-hidden="true" />
        </div>

        <div>
          <h2 className="font-semibold">
            Target career
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a role to compare against your current experience.
          </p>
        </div>
      </div>

      <div
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Career roles"
      >
        {roles.map((role) => {
          const isSelected = role.id === selectedRoleId;

          return (
            <button
              key={role.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(role.id)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition",
                "hover:border-rose-300 hover:bg-muted/40",
                isSelected
                  ? "border-rose-400 bg-rose-50/60 ring-1 ring-rose-300 dark:bg-rose-950/20"
                  : "bg-background",
              )}
            >
              {isSelected ? (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white">
                  <Check
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                </span>
              ) : null}

              <p className="pr-7 text-sm font-semibold">
                {role.title}
              </p>

              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {role.description}
              </p>

              <p className="mt-3 text-[11px] font-medium text-muted-foreground">
                {
                  role.requirements.filter(
                    (requirement) =>
                      requirement.importance === "required",
                  ).length
                }{" "}
                required skills
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border bg-muted/30 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Current target
          </p>

          <h3 className="mt-1 text-lg font-semibold">
            {selectedRole.title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {selectedRole.description}
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold">
              Required skills
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {requiredSkills.map((requirement) => (
                <span
                  key={requirement.skillId}
                  className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300"
                >
                  {requirement.skillName}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold">
              Preferred skills
            </p>

            {preferredSkills.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {preferredSkills.map((requirement) => (
                  <span
                    key={requirement.skillId}
                    className="rounded-full border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {requirement.skillName}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                No preferred skills listed.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}