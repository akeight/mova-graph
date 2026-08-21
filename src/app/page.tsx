import { LandingPage } from "@/features/landing/components/landing-page";
import { getAuthenticatedUser } from "@/features/auth/services/session";

export default async function HomePage() {
  const user = await getAuthenticatedUser();

  return <LandingPage signedIn={Boolean(user)} />;
}
