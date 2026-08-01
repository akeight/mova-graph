import type {
    CourseProgress,
    ExperienceProgress,
    SkillProgress,
  } from "../types/student-profile";
  
  export type ProfileItemProgress =
    | CourseProgress
    | ExperienceProgress;
  
  export function getSkillContributionStatus(
    status: ProfileItemProgress,
  ): SkillProgress | null {
    switch (status) {
      case "completed":
        return "demonstrated";
  
      case "in-progress":
        return "developing";
  
      case "planned":
      case "dropped":
        return null;
    }
  }
  
  export function isProfileItemVisible(
    status: ProfileItemProgress,
  ): boolean {
    return status !== "dropped";
  }