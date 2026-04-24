export type ComposerTrigger =
  | { kind: "none" }
  | { kind: "mention"; from: number; to: number; query: string }
  | { kind: "emoji"; from: number; to: number; query: string };

const MENTION_LEFT = /(?:^|[\s\n])@([\w.-]*)$/;
const EMOJI_LEFT = /(?:^|[\s\n]):([\w+-]*)$/;

function lastBoundaryIndex(left: string, char: string): number {
  const i = left.lastIndexOf(char);
  if (i < 0) return -1;
  if (i === 0) return i;
  return /[\s\n]/.test(left[i - 1]!) ? i : -1;
}

export function detectComposerTrigger(text: string, cursor: number): ComposerTrigger {
  const left = text.slice(0, Math.min(cursor, text.length));
  let mention: ComposerTrigger = { kind: "none" };
  let emoji: ComposerTrigger = { kind: "none" };

  const mM = left.match(MENTION_LEFT);
  if (mM && mM.index !== undefined) {
    const at = lastBoundaryIndex(left, "@");
    if (at >= 0) {
      const query = left.slice(at + 1);
      mention = { kind: "mention", from: at, to: cursor, query };
    }
  }

  const mE = left.match(EMOJI_LEFT);
  if (mE && mE.index !== undefined) {
    const colon = lastBoundaryIndex(left, ":");
    if (colon >= 0) {
      const query = left.slice(colon + 1);
      emoji = { kind: "emoji", from: colon, to: cursor, query };
    }
  }

  if (mention.kind === "mention" && emoji.kind === "emoji") {
    return mention.from >= emoji.from ? mention : emoji;
  }
  if (mention.kind === "mention") return mention;
  if (emoji.kind === "emoji") return emoji;
  return { kind: "none" };
}

export type EmojiSuggestion = { key: string; emoji: string };

export const EMOJI_SUGGESTIONS: EmojiSuggestion[] = [
  { key: "smile", emoji: "😊" },
  { key: "joy", emoji: "😂" },
  { key: "thumbsup", emoji: "👍" },
  { key: "fire", emoji: "🔥" },
  { key: "check", emoji: "✅" },
  { key: "construction", emoji: "🚧" },
  { key: "memo", emoji: "📝" },
  { key: "dart", emoji: "🎯" },
  { key: "pray", emoji: "🙏" },
  { key: "clap", emoji: "👏" },
  { key: "warning", emoji: "⚠️" },
  { key: "rocket", emoji: "🚀" },
];
