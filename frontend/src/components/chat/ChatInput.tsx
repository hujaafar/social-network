"use client";
import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { useChatSocket } from "@/lib/ChatSocketProvider";
export function ChatInput({ currentUserId, userId }: { currentUserId: string; userId: string }) {
  const [message, setMessage] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { sendMessage, connected, error } = useChatSocket();
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !connected || pending || message.trim().split(/\s+/).length > 200)
      return;
    setPending(true);
    const sent = await sendMessage({
      sender_id: currentUserId,
      receiver_id: userId,
      message: message.trim(),
      type: "message",
      sender_name: "",
    });
    if (sent) setMessage("");
    setPending(false);
  }
  return (
    <div className="chat-composer">
      {error && (
        <p role="alert" className="inline-error mb-3">
          {error}
        </p>
      )}
      {!connected && (
        <p className="inline-note mb-3" role="status">
          Reconnecting. Your draft stays here.
        </p>
      )}
      {emojiOpen && (
        <div className="emoji-options" aria-label="Choose an emoji">
          {["😀", "❤️", "🙌", "🎉", "✨", "👋", "🔥", "👍"].map((emoji) => (
            <button
              key={emoji}
              aria-label={`Insert ${emoji}`}
              onClick={() => {
                setMessage((text) => text + emoji);
                setEmojiOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={submit}>
        <button
          type="button"
          className="icon-button"
          aria-label="Choose an emoji"
          aria-expanded={emojiOpen}
          onClick={() => setEmojiOpen(!emojiOpen)}
        >
          <Smile size={21} />
        </button>
        <input
          aria-label="Message"
          placeholder="Say something good…"
          value={message}
          maxLength={2000}
          disabled={pending}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit"
          className="send-button"
          disabled={
            !connected || !message.trim() || pending || message.trim().split(/\s+/).length > 200
          }
          aria-label={pending ? "Sending message" : "Send message"}
        >
          <Send size={18} />
        </button>
      </form>
      {message.trim().split(/\s+/).length > 200 && (
        <p role="alert" className="inline-note mt-2">
          Keep your message under 200 words.
        </p>
      )}
    </div>
  );
}
