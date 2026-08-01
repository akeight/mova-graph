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

export type StudentCourse = {
  id: string;
  title: string;
  description?: string;
  status: CourseProgress;
  skillIds: string[];
};

export type StudentExperience = {
  id: string;
  title: string;
  description?: string;
  status: ExperienceProgress;
  skillIds: string[];
};

export type StudentSkill = {
  id: string;
  name: string;
  status: SkillProgress;
};

export type StudentProfile = {
  id: string;
  name: string;
  program?: string;
  courses: StudentCourse[];
  experiences: StudentExperience[];
  skills: StudentSkill[];
};