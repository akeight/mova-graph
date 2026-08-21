import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { getAuthenticatedUser } from "@/features/auth/services/session";
import { getPostLoginPath } from "@/lib/app-routes";

export default async function LoginPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(getPostLoginPath());
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-muted/30 p-4">
      <div className="text-center">
        <p className="font-heading text-2xl font-semibold text-foreground">
          Mova
        </p>
        <p className="text-sm text-muted-foreground">
          Make every move count.
        </p>
      </div>

      <AuthForm />
    </main>
  );
}
