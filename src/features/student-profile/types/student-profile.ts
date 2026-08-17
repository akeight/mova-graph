export type CourseProgress =
  | "planned"
  | "in-progress"
  | "completed"
  | "dropped";

export type ExperienceProgress =
  | "planned"
  | "in-progress"
  | "completed"
  | "dropped";

export type SkillProgress =
  | "demonstrated"
  | "developing";

export type CourseKind =
  | "course"
  | "certification";

export type ExperienceKind =
  | "work"
  | "project"
  | "volunteer"
  | "leadership"
  | "other";

export type StudentCourse = {
  id: string;
  title: string;
  description?: string;
  status: CourseProgress;
  skillIds: string[];
  kind?: CourseKind;
};

export type StudentExperience = {
  id: string;
  title: string;
  description?: string;
  status: ExperienceProgress;
  skillIds: string[];
  kind?: ExperienceKind;
  organization?: string;
  startDate?: string;
  endDate?: string;
};

export type StudentSkill = {
  id: string;
  name: string;
  status: SkillProgress;
  selfReported?: boolean;
};

export type StudentProfile = {
  id: string;
  name: string;
  program?: string;
  institution?: string;
  courses: StudentCourse[];
  experiences: StudentExperience[];
  skills: StudentSkill[];
};
