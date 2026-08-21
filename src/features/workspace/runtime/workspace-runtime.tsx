"use client";

import { createContext, useContext, type ReactNode } from "react";

import { extractOpportunitySource } from
  "@/features/opportunity-what-if/services/extract-opportunity-client";
import type { OpportunityExtraction } from
  "@/features/opportunity-what-if/types/opportunity-what-if";
import type { OpportunityExtractionInput } from
  "@/features/opportunity-what-if/schemas/opportunity-extraction";
import {
  extractResumeSource,
  parseResumeFile,
} from "@/features/resume-import/services/resume-import-client";
import type { ResumeImportDraft } from
  "@/features/resume-import/types/resume-import";

import {
  extractDemoOpportunitySource,
  extractDemoResumeSource,
  parseDemoResumeFile,
} from "@/features/demo/runtime/demo-extractors";

export type WorkspaceRuntimeKind = "authenticated" | "demo";

export type WorkspaceRuntime = {
  kind: WorkspaceRuntimeKind;
  extractResumeSource: (input: {
    sourceId: string;
    displayName: string;
    text: string;
  }) => Promise<ResumeImportDraft>;
  parseResumeFile: (file: File) => Promise<{
    displayName: string;
    text: string;
  }>;
  extractOpportunitySource: (
    input: OpportunityExtractionInput,
  ) => Promise<OpportunityExtraction>;
};

export const authenticatedWorkspaceRuntime: WorkspaceRuntime = {
  kind: "authenticated",
  extractResumeSource,
  parseResumeFile,
  extractOpportunitySource,
};

export const demoWorkspaceRuntime: WorkspaceRuntime = {
  kind: "demo",
  extractResumeSource: extractDemoResumeSource,
  parseResumeFile: parseDemoResumeFile,
  extractOpportunitySource: extractDemoOpportunitySource,
};

const WorkspaceRuntimeContext = createContext<WorkspaceRuntime>(
  authenticatedWorkspaceRuntime,
);

export function WorkspaceRuntimeProvider({
  value,
  children,
}: {
  value: WorkspaceRuntime;
  children: ReactNode;
}) {
  return (
    <WorkspaceRuntimeContext.Provider value={value}>
      {children}
    </WorkspaceRuntimeContext.Provider>
  );
}

export function useWorkspaceRuntime(): WorkspaceRuntime {
  return useContext(WorkspaceRuntimeContext);
}
