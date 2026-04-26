import { AppPage } from "@/pages/shared/AppPage";

const jobs = [
  {
    id: "JOB-0214",
    title: "Site Engineer - High Rise",
    location: "Austin, TX",
    company: "BuildWire Contractors",
    posted: "2h ago",
  },
  {
    id: "JOB-0218",
    title: "MEP Supervisor",
    location: "Dallas, TX",
    company: "Prime MEP Services",
    posted: "5h ago",
  },
  {
    id: "JOB-0221",
    title: "Concrete Foreman",
    location: "Houston, TX",
    company: "SolidForm Concrete",
    posted: "1d ago",
  },
];

export default function HiringFeedPage() {
  return (
    <AppPage
      title="Hiring & Jobs"
      description="Discover roles, manage hiring pipelines, and coordinate workforce allocation."
    >
      <div className="mx-auto max-w-4xl space-y-4">
        {jobs.map((job) => (
          <article
            key={job.id}
            className="rounded-[10px] border border-border bg-surface p-4 shadow-token-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-primary">{job.title}</h2>
                <p className="mt-1 text-sm text-secondary">
                  {job.company} · {job.location}
                </p>
              </div>
              <span className="rounded-md border border-border bg-bg px-2 py-1 text-xs text-muted">
                {job.id}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted">Posted {job.posted}</p>
          </article>
        ))}
      </div>
    </AppPage>
  );
}
