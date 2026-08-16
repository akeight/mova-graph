"use client";

import { Check, Target } from "lucide-react";

import { cn } from "@/lib/utils";

import { getCompetencyDefinition } from "../data/competencies";
import type { CareerCompetencyTier, CareerRole } from "../types/career-role";

type CareerRoleSelectorProps = {
  roles: CareerRole[];
  selectedRoleId: string;
  onSelect: (roleId: string) => void;
};

const TIER_LABELS: Record<CareerCompetencyTier, string> = {
  core: "Core",
  common: "Common",
  specialized: "Specialized",
};

export function CareerRoleSelector({
  roles,
  selectedRoleId,
  onSelect,
}: CareerRoleSelectorProps) {
  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  const competenciesByTier = {
    core: selectedRole.competencies.filter(
      (assignment) => assignment.tier === "core",
    ),
    common: selectedRole.competencies.filter(
      (assignment) => assignment.tier === "common",
    ),
    specialized: selectedRole.competencies.filter(
      (assignment) => assignment.tier === "specialized",
    ),
  };

  return (
    <section className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-category-role/12 text-category-role">
          <Target className="h-5 w-5" aria-hidden="true" />
        </div>

        <div>
          <h2 className="font-semibold">
            Target career
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a career type. Readiness measures preparation for
            this kind of work, not a match to one employer&apos;s stack.
          </p>
        </div>
      </div>

      <div
        className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Career roles"
      >
        {roles.map((role) => {
          const isSelected = role.id === selectedRoleId;
          const coreCount = role.competencies.filter(
            (assignment) => assignment.tier === "core",
          ).length;

          return (
            <button
              key={role.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(role.id)}
              className={cn(
                "relative rounded-xl border p-4 text-left transition",
                "hover:border-category-role/50 hover:bg-muted/40",
                isSelected
                  ? "border-category-role/60 bg-category-role/8 ring-1 ring-category-role/40"
                  : "bg-background",
              )}
            >
              {isSelected ? (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-category-role text-white">
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
                {coreCount} core competencies
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

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Core is foundational for this career type. Common is
            frequently valuable across roles. Specialized varies by
            company, stack, or focus.
          </p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(["core", "common", "specialized"] as const).map((tier) => {
            const assignments = competenciesByTier[tier];

            return (
              <div key={tier}>
                <p className="text-xs font-semibold">
                  {TIER_LABELS[tier]}
                </p>

                {assignments.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {assignments.map((assignment) => (
                      <span
                        key={assignment.competencyId}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-medium",
                          tier === "core"
                            ? "border-category-role/30 bg-category-role/10 text-category-role"
                            : "border bg-background text-muted-foreground",
                        )}
                      >
                        {
                          getCompetencyDefinition(
                            assignment.competencyId,
                          ).name
                        }
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    None listed.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
