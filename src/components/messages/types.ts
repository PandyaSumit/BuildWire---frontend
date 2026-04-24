export type MessagesWorkspaceMode = "inbox" | "channels" | "dms";
export type ConversationKind = "channel" | "group" | "dm";

export type Conversation = {
  id: string;
  kind: ConversationKind;
  title: string;
  subtitle: string;
  members: number;
  unread: number;
  updatedAt: string;
  lastMessage: string;
  avatarColor?: string;
  online?: boolean;
  lastSeen?: string;
  visibility?: "public" | "private";
  muted?: boolean;
};

export type MessageAttachment = {
  id: string;
  name: string;
  sizeKb: number;
  type: "image" | "pdf" | "doc" | "other";
};

export type Message = {
  id: string;
  conversationId: string;
  author: string;
  avatarColor?: string;
  text: string;
  time: string;
  date?: string;
  mine?: boolean;
  status?: "sent" | "delivered" | "read";
  threadCount?: number;
  saved?: boolean;
  pinned?: boolean;
  attachments?: MessageAttachment[];
  reactions?: Array<{
    emoji: string;
    count: number;
    mine?: boolean;
  }>;
};
