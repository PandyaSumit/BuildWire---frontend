import { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ACTIVITY_ENTITY_ICON } from "@/config/pm/activity";
import { ModulePageShell } from "@/features/project-ui/components";
import {
  DUMMY_ACTIVITY_LOG,
  type LogEvent,
} from "@/features/project-ui/projectDummyData";

const EventRow = memo(function EventRow({ event }: { event: LogEvent }) {
  const icon = event.entity ? ACTIVITY_ENTITY_ICON[event.entity] : "·";
  return (
    <li className="group flex gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/[0.06]">
      <div className="relative mt-0.5 flex shrink-0 flex-col items-center">
        <Avatar name={event.user} size="sm" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-primary">
          <span className="font-semibold">{event.user}</span>{" "}
          <span className="text-secondary">{event.text}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-muted">{event.when}</p>
      </div>
      {event.entity ? (
        <span className="mt-1 shrink-0 rounded-md border border-border/60 bg-bg px-1.5 py-0.5 text-[11px] text-muted">
          {icon}
        </span>
      ) : null}
    </li>
  );
});

export default function ProjectActivityPage() {
  return (
    <ModulePageShell>
      <PageHeader
        title="Activity log"
        description="Immutable audit trail — export for compliance."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-border/60 px-3 py-2 text-sm text-secondary hover:bg-muted/10 hover:text-primary"
            >
              Filter
            </button>
            <Button size="sm" variant="secondary">
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {DUMMY_ACTIVITY_LOG.map((group) => (
          <section key={group.label}>
            <div className="mb-2 flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {group.label}
              </p>
              <div className="h-px flex-1 bg-border/50" />
            </div>
            <ul className="space-y-0.5">
              {group.events.map((e, i) => (
                <EventRow key={`${group.label}-${i}`} event={e} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </ModulePageShell>
  );
}
