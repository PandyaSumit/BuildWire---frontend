import type { ReactNode } from "react";
import { mainWorkspacePageClassName } from "@/layouts/shell/workspace";

/** Shared page chrome (title + description) for org and project screens. */
export function AppPage({
  title,
  description,
  children,
  fullHeight = false,
  contentClassName,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  fullHeight?: boolean;
  contentClassName?: string;
}) {
  const rootClass = fullHeight
    ? `flex h-full min-h-0 flex-col gap-4 ${mainWorkspacePageClassName()}`
    : mainWorkspacePageClassName();
  const bodyClass = fullHeight
    ? `min-h-0 flex-1 ${contentClassName ?? ""}`
    : (contentClassName ?? "");

  return (
    <div className={rootClass}>
      <div className="flex shrink-0 flex-col justify-center">
        <h1 className="text-lg font-semibold leading-tight text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-0.5 line-clamp-1 max-w-2xl text-sm leading-snug text-secondary">
            {description}
          </p>
        )}
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}
