import { DUMMY_ACTIVITY_LOG } from "@/features/project-ui/projectDummyData";

export default function ProjectActivityPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Activity log
          </h1>
          <p className="text-sm text-secondary">
            Immutable audit trail — export for compliance.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            Filter
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-2 text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {DUMMY_ACTIVITY_LOG.map((group) => (
          <div key={group.label}>
            <p className="mb-3 text-xs font-semibold uppercase text-muted">
              {group.label}
            </p>
            <ul className="space-y-2">
              {group.events.map((e, i) => (
                <li
                  key={`${group.label}-${i}`}
                  className="flex gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm"
                >
                  <div className="h-9 w-9 shrink-0 rounded-full bg-brand-light text-center text-xs font-bold leading-9 text-brand">
                    {e.user[0]}
                  </div>
                  <div>
                    <p className="text-primary">
                      <span className="font-semibold">{e.user}</span> {e.text}
                    </p>
                    <p className="text-xs text-muted">{e.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
