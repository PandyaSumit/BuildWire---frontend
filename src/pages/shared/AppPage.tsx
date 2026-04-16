import type { ReactNode } from "react";

/** Shared page chrome (title + description) for org and project screens. */
export function AppPage({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6 p-6">
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
      <div>{children}</div>
    </div>
  );
}
