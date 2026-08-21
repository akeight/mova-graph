import { redirect } from "next/navigation";
import Link from "next/link";

import { PublicPageFrame } from "@/components/public-page-frame";
import { AuthForm } from "@/features/auth/components/auth-form";
import { getAuthenticatedUser } from "@/features/auth/services/session";
import { getPostLoginPath, LANDING_PATH } from "@/lib/app-routes";

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(getPostLoginPath());
  }

  return (
    <PublicPageFrame>
      <main className="flex min-h-dvh flex-col items-center justify-center gap-8 p-4">
        <div className="text-center">
          <Link
            href={LANDING_PATH}
            className="font-wordmark text-3xl text-foreground transition-opacity hover:opacity-80"
          >
            Mova
          </Link>
          <p className="text-sm text-muted-foreground">
            Make every move count.
          </p>
        </div>

        <AuthForm />
      </main>
    </PublicPageFrame>
  );
}
