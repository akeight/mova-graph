import { MovaWorkspace } from "@/features/pathway-graph/components/mova-workspace";
import { requireUser } from "@/features/auth/services/session";

export default async function HomePage() {
  const user = await requireUser();

  return <MovaWorkspace userEmail={user.email ?? null} />;
}
