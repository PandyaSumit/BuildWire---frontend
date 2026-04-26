import { useEffect, useRef, useState } from "react";

export type UserOption = { id: string; name: string; initials: string };

type Props = {
  label: string;
  users: UserOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

function getInitialsColor(id: string): string {
  const palette = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function UserMultiSelect({ label, users, selectedIds, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = users.filter((u) => selectedIds.includes(u.id));
  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }

  function remove(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-1.5 text-[12.5px] font-medium text-primary">{label}</p>

      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen((v) => !v)}
        className={`flex min-h-[38px] w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-lg border bg-bg px-2.5 py-1.5 text-sm transition-all focus:outline-none focus:ring-1 ${
          open
            ? "border-brand ring-1 ring-brand"
            : "border-border/70 hover:border-border"
        }`}
      >
        {selected.length === 0 ? (
          <span className="text-muted">Select people…</span>
        ) : (
          selected.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface pl-1 pr-1.5 py-0.5 text-[12px] font-medium text-primary"
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${getInitialsColor(u.id)}`}
              >
                {u.initials}
              </span>
              {u.name}
              <button
                type="button"
                onClick={(e) => remove(u.id, e)}
                className="ml-0.5 text-muted hover:text-danger focus:outline-none"
                aria-label={`Remove ${u.name}`}
              >
                ×
              </button>
            </span>
          ))
        )}
        <span className="ml-auto shrink-0 text-muted">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-[200] mt-1 rounded-xl border border-border/70 bg-elevated shadow-lg">
          <div className="border-b border-border/40 px-3 py-2">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full bg-transparent text-sm text-primary placeholder:text-muted focus:outline-none"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted">No results</li>
            ) : (
              filtered.map((u) => {
                const checked = selectedIds.includes(u.id);
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => toggle(u.id)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-surface"
                    >
                      <span
                        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${getInitialsColor(u.id)}`}
                      >
                        {u.initials}
                      </span>
                      <span className="flex-1 text-left text-primary">{u.name}</span>
                      {checked && (
                        <svg className="h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {selected.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5">
              <span className="text-[11px] text-muted">{selected.length} selected</span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px] text-danger hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
