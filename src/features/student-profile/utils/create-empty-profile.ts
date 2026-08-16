import type { StudentProfile } from
  "../types/student-profile";

type CreateEmptyProfileOptions = {
  id?: string;
  name?: string;
};

/**
 * Builds a clean, empty profile for a genuinely new user: no courses,
 * experiences, or skills. `id` and `name` are required to be non-empty by the
 * persistence schema, so we default them to safe values.
 */
export function createEmptyProfile(
  options: CreateEmptyProfileOptions = {},
): StudentProfile {
  const name = options.name?.trim();

  return {
    id: options.id ?? crypto.randomUUID(),
    name: name && name.length > 0 ? name : "New student",
    courses: [],
    experiences: [],
    skills: [],
  };
}
