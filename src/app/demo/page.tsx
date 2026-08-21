import { PublicDemoPage } from "@/features/demo/components/public-demo-page";
import { getAuthenticatedUser } from "@/features/auth/services/session";

export default async function DemoPage() {
  const user = await getAuthenticatedUser();

  return <PublicDemoPage sessionEmail={user?.email ?? null} />;
}
