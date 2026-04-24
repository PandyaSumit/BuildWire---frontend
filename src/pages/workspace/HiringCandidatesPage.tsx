import { AppPage } from "@/pages/shared/AppPage";

export default function HiringCandidatesPage() {
  return (
    <AppPage
      title="Candidates"
      description="Review shortlisted applicants and move them through interview stages."
    >
      <div className="mx-auto max-w-4xl rounded-[10px] border border-border bg-surface p-4 shadow-token-sm">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
            <span className="font-medium text-primary">Priya Sharma · Site Engineer</span>
            <span className="text-xs text-success">Interview scheduled</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
            <span className="font-medium text-primary">Ahmed Khan · MEP Supervisor</span>
            <span className="text-xs text-warning">Needs review</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
            <span className="font-medium text-primary">Rohan Das · Quantity Surveyor</span>
            <span className="text-xs text-info">Shortlisted</span>
          </div>
        </div>
      </div>
    </AppPage>
  );
}
