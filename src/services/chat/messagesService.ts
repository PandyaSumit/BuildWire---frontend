import type { Conversation, Message } from "@/types/chat";

export async function fetchConversations(): Promise<Conversation[]> {
  throw new Error("Not implemented — connect to API");
}

export async function fetchMessages(_conversationId: string): Promise<Message[]> {
  throw new Error("Not implemented — connect to API");
}

export async function sendMessage(
  _conversationId: string,
  _text: string,
): Promise<Message> {
  throw new Error("Not implemented — connect to API");
}

export async function deleteMessage(_messageId: string): Promise<void> {
  throw new Error("Not implemented — connect to API");
}
