export default function Dashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex h-16 shrink-0 flex-col justify-center">
        <h1 className="text-lg font-semibold leading-tight text-primary">Dashboard</h1>
        <p className="mt-0.5 line-clamp-1 max-w-2xl text-sm leading-snug text-secondary">
          Organization-wide KPIs and activity — role-aware tiles will populate here.
        </p>
      </div>
      <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-secondary">
              Total Projects
            </span>
            <svg
              className="w-5 h-5 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">24</p>
              <p className="text-xs text-success mt-1">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-secondary">
              Active Tasks
            </span>
            <svg
              className="w-5 h-5 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">156</p>
              <p className="text-xs text-warning mt-1">23 due this week</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-secondary">
              Team Members
            </span>
            <svg
              className="w-5 h-5 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">48</p>
              <p className="text-xs text-success mt-1">+4 new this month</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-secondary">
              Total Budget
            </span>
            <svg
              className="w-5 h-5 text-brand"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-primary">$2.4M</p>
              <p className="text-xs text-muted mt-1">Across all projects</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-primary mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              action: "New project created",
              project: "Downtown Office Building",
              time: "2 hours ago",
              type: "success",
            },
            {
              action: "Task completed",
              project: "Residential Complex Phase 2",
              time: "5 hours ago",
              type: "success",
            },
            {
              action: "Budget alert",
              project: "Highway Extension Project",
              time: "1 day ago",
              type: "warning",
            },
            {
              action: "Team member added",
              project: "Shopping Mall Renovation",
              time: "2 days ago",
              type: "default",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 ${
                  item.type === "success"
                    ? "bg-success"
                    : item.type === "warning"
                      ? "bg-warning"
                      : "bg-muted"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary">
                  {item.action}
                </p>
                <p className="text-sm text-secondary truncate">
                  {item.project}
                </p>
              </div>
              <span className="text-xs text-muted whitespace-nowrap">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
