import { DotGridBackdrop } from "@/components/dot-grid-backdrop";
import { ForceLightTheme } from "@/components/force-light-theme";

export function PublicPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-background">
      <script
        dangerouslySetInnerHTML={{
          __html:
            'document.documentElement.classList.remove("dark");document.documentElement.classList.add("light");document.documentElement.style.colorScheme="light";',
        }}
      />
      <ForceLightTheme />
      <DotGridBackdrop />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
