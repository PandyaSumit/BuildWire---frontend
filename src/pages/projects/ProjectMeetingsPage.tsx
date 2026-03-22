import { DUMMY_MEETINGS } from "@/features/project-ui/projectDummyData";

export default function ProjectMeetingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-dm-sans)] text-xl font-bold text-primary">
            Meetings
          </h1>
          <p className="text-sm text-secondary">
            Agenda, minutes, action items → tasks.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white dark:text-bg"
        >
          + New meeting
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Meeting</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Attendees</th>
              <th className="px-4 py-3">Action items</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_MEETINGS.map((m) => (
              <tr key={m.name} className="border-b border-border/60">
                <td className="px-4 py-3 font-medium text-primary">{m.name}</td>
                <td className="px-4 py-3">{m.type}</td>
                <td className="px-4 py-3 whitespace-nowrap">{m.date}</td>
                <td className="px-4 py-3">{m.attendees}</td>
                <td className="px-4 py-3">{m.actions}</td>
                <td className="px-4 py-3">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
