export const MESSAGES_LAYOUT = {
  sidebar: {
    min: 200,
    max: 400,
    default: 272,
    storageKey: "bw.messages.sidebarWidth",
  },
  breakpoints: {
    compact: 1024,
  },
} as const;

export function isCompactMessagesViewport(width: number): boolean {
  return width < MESSAGES_LAYOUT.breakpoints.compact;
}
