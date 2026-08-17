import { PROFILE_ITEM_DESCRIPTION_MAX } from
  "@/features/student-profile/constants";

export function combineProfileDescriptions(
  left?: string,
  right?: string,
  maxLength = PROFILE_ITEM_DESCRIPTION_MAX,
): string | undefined {
  const first = left?.trim() ?? "";
  const second = right?.trim() ?? "";

  if (!first) {
    return second || undefined;
  }

  if (!second || first === second || first.includes(second)) {
    return first.slice(0, maxLength) || undefined;
  }

  if (second.includes(first)) {
    return second.slice(0, maxLength) || undefined;
  }

  const combined = `${first}\n\n${second}`;

  if (combined.length <= maxLength) {
    return combined;
  }

  const truncated = combined.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace >= maxLength * 0.6) {
    return truncated.slice(0, lastSpace).trim() || undefined;
  }

  return truncated.trim() || undefined;
}
