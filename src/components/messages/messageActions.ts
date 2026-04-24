export type MessageActionId =
  | "copyText"
  | "copyLink"
  | "quoteReply"
  | "editMessage"
  | "deleteMessage";

export type MessageActionItem = {
  id: MessageActionId;
  label: string;
  danger?: boolean;
};

export function getMessageActionItems(mine: boolean): MessageActionItem[] {
  const base: MessageActionItem[] = [
    { id: "copyText", label: "Copy text" },
    { id: "copyLink", label: "Copy message link" },
    { id: "quoteReply", label: "Quote reply" },
  ];

  if (!mine) return base;

  return [
    ...base,
    { id: "editMessage", label: "Edit message" },
    { id: "deleteMessage", label: "Delete message", danger: true },
  ];
}
