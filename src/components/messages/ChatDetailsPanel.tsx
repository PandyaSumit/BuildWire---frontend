import { useState } from "react";
import type { Conversation } from "./types";

type ChatDetailsPanelProps = {
  conversation: Conversation | null;
  onClose: () => void;
};

const MOCK_MEMBERS = [
  { name: "Hillary Case", role: "Project Coordinator", color: "bg-pink-500", online: true },
  { name: "Project Ops", role: "Operations Lead", color: "bg-blue-500", online: true },
  { name: "John Martinez", role: "Site Engineer", color: "bg-teal-500", online: true },
  { name: "Talent Lead", role: "HR Manager", color: "bg-green-600", online: false },
  { name: "Site Admin", role: "Field Supervisor", color: "bg-amber-500", online: false },
];

const PINNED = [
  { id: "p1", label: "Weekly progress template" },
  { id: "p2", label: "Safety checklist v4" },
];

const TABS = ["About", "Members", "Pins", "Media"] as const;
type Tab = (typeof TABS)[number];

function Avatar({ name, color }: { name: string; color?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[12px] font-bold text-white ${color ?? "bg-brand"}`}
    >
      {initials}
    </span>
  );
}

function kindLabel(kind: Conversation["kind"]): string {
  if (kind === "channel") return "Channel";
  if (kind === "group") return "Group";
  return "Direct message";
}

const SHARED_MEDIA = [
  "Site_Photos_Week14.zip",
  "QA_Report_MEP.pdf",
  "Design_Review_Recordings.mp4",
];

export function ChatDetailsPanel({ conversation, onClose }: ChatDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("About");

  return (
    <aside className="flex min-h-0 w-full flex-1 flex-col overflow-hidden border-l border-border bg-surface">
      {/* Header — 52px to align with Messages + chat title bars */}
      <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border px-4">
        <h3 className="text-[14px] font-semibold leading-none text-primary">Details</h3>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-primary/8 hover:text-primary"
          aria-label="Close details"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {!conversation ? (
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="text-[12.5px] text-muted">Select a conversation to view details</p>
        </div>
      ) : (
        <>
          {/* Conversation card */}
          <div className="shrink-0 border-b border-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-bg text-[20px] font-bold text-muted">
                {conversation.kind === "channel" ? "#" : (
                  <Avatar name={conversation.title} color={conversation.avatarColor} />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-primary">
                  {conversation.kind === "channel" ? `# ${conversation.title}` : conversation.title}
                </p>
                <p className="text-[11px] text-muted">{kindLabel(conversation.kind)}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex shrink-0 border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "flex-1 py-2.5 text-[12px] font-medium transition-colors",
                  activeTab === tab
                    ? "border-b-2 border-brand text-brand"
                    : "text-muted hover:text-secondary",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
            {activeTab === "About" && (
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">Description</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-secondary">{conversation.subtitle}</p>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted">Security</p>
                  <p className="mt-1 text-[12px] text-secondary">
                    {conversation.visibility === "private" ? "Private channel with restricted access" : "Public channel within workspace"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted">Retention</p>
                  <p className="mt-1 text-[12px] text-secondary">Messages retained for 365 days. Audit trail enabled.</p>
                </div>

                <div className="h-px bg-border/60" />

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted">Type</p>
                    <p className="mt-1 text-[13px] font-semibold text-primary">{kindLabel(conversation.kind)}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-bg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted">Members</p>
                    <p className="mt-1 text-[13px] font-semibold text-primary">{conversation.members}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted">Notifications</p>
                  <div className="mt-2 flex items-center justify-between text-[12px] text-secondary">
                    <span>Mute channel</span>
                    <span className={conversation.muted ? "text-brand" : "text-muted"}>
                      {conversation.muted ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Members" && (
              <div className="p-3">
                <p className="px-1 pb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                  {Math.min(MOCK_MEMBERS.length, conversation.members)} members
                </p>
                <div className="space-y-0.5">
                  {MOCK_MEMBERS.slice(0, conversation.members).map((member) => (
                    <div
                      key={member.name}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-bg"
                    >
                      <div className="relative shrink-0">
                        <Avatar name={member.name} color={member.color} />
                        <span
                          className={[
                            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-surface",
                            member.online ? "bg-green-500" : "bg-border",
                          ].join(" ")}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-primary">{member.name}</p>
                        <p className="truncate text-[11px] text-muted">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Pins" && (
              <div className="p-4">
                <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                  Pinned messages
                </p>
                <div className="space-y-2">
                  {PINNED.map((pin) => (
                    <div
                      key={pin.id}
                      className="flex items-start gap-2.5 rounded-lg border border-border bg-bg p-3 transition-colors hover:border-brand/30"
                    >
                      <svg
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      <p className="text-[12.5px] leading-snug text-secondary">{pin.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === "Media" && (
              <div className="p-4">
                <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                  Shared files and links
                </p>
                <div className="space-y-2">
                  {SHARED_MEDIA.map((item) => (
                    <div
                      key={item}
                      className="rounded-lg border border-border bg-bg px-3 py-2 text-[12px] text-secondary"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
