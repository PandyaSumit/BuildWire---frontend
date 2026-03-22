/**
 * Task notification hooks — wire to in-app bell, email, and (future) WhatsApp.
 * Call these from task mutations after successful API responses.
 */

export type TaskNotificationChannel = 'in_app' | 'email' | 'whatsapp';

export type TaskNotificationEvent =
  | { kind: 'assigned'; taskId: string; userIds: string[] }
  | { kind: 'status_changed'; taskId: string; from: string; to: string; actorId: string }
  | { kind: 'comment_added'; taskId: string; commentId: string; authorId: string }
  | { kind: 'overdue_digest'; taskIds: string[]; userId: string }
  | { kind: 'blocked'; taskId: string; reason: string; actorId: string }
  | { kind: 'due_date_changed'; taskId: string; previous: string; next: string; actorId: string };

export type TaskNotificationPreferences = {
  in_app: boolean;
  email: boolean;
  whatsapp: boolean;
};

const defaultPrefs: TaskNotificationPreferences = {
  in_app: true,
  email: true,
  whatsapp: false,
};

/** Placeholder: enqueue for bell + email services */
export function emitTaskNotification(
  event: TaskNotificationEvent,
  channels: TaskNotificationChannel[] = ['in_app', 'email']
): void {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[taskNotifications]', event, channels);
  }
  // TODO: push to Redux notification slice + POST /notifications/email
}

export function getTaskNotificationPrefs(): TaskNotificationPreferences {
  return { ...defaultPrefs };
}

/** Future: WhatsApp Business API — no-op stub */
export function scheduleWhatsAppTaskDigest(_userId: string, _taskIds: string[]): void {
  // intentionally empty
}
