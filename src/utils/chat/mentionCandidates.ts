import type { Conversation, Message } from "@/types/chat";

const FALLBACK_NAMES = [
  "Project Ops",
  "Hillary Case",
  "John Martinez",
  "Talent Lead",
  "Site Admin",
  "Team",
];

export function buildMentionCandidates(
  conversation: Conversation | null,
  messages: Message[],
): string[] {
  const names = new Set<string>();
  for (const n of FALLBACK_NAMES) names.add(n);
  if (conversation?.title) names.add(conversation.title.replace(/^#\s*/, "").trim());
  for (const m of messages) {
    if (m.author && m.author !== "System") names.add(m.author);
  }
  names.add("You");
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}
