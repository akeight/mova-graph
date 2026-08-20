import type {
  StudentCourse,
  StudentExperience,
} from "../types/student-profile";

export function profileItemTypeLabel(
  kind: "course" | "experience",
  item: StudentCourse | StudentExperience,
): string {
  if (kind === "course") {
    return item.kind === "certification" ? "Certification" : "Course";
  }

  switch (item.kind) {
    case "project":
      return "Project";
    case "volunteer":
      return "Volunteer";
    case "leadership":
      return "Leadership";
    case "work":
      return "Work";
    default:
      return "Experience";
  }
}

export function profileItemStatusLabel(
  status: StudentCourse["status"] | StudentExperience["status"],
): string {
  switch (status) {
    case "in-progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "planned":
      return "Planned";
    case "dropped":
      return "Dropped";
  }
}
