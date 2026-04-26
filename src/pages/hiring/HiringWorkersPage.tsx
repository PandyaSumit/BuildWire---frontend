import { AppPage } from "@/pages/shared/AppPage";

export default function HiringWorkersPage() {
  return (
    <AppPage
      title="Workers"
      description="Track active workers, availability, and assignment readiness."
    >
      <div className="mx-auto max-w-4xl rounded-[10px] border border-border bg-surface p-4 shadow-token-sm">
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
            <span className="text-primary">Active workers</span>
            <span className="font-semibold text-primary">184</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
            <span className="text-primary">Available this week</span>
            <span className="font-semibold text-primary">47</span>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border bg-bg px-3 py-2">
            <span className="text-primary">Pending onboarding</span>
            <span className="font-semibold text-primary">12</span>
          </div>
        </div>
      </div>
    </AppPage>
  );
}
