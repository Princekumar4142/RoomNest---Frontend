import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Send, MessageCircle } from "lucide-react";
import { messageApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../utils/socket";
import { Spinner } from "../components/ui/Primitives";
import toast from "react-hot-toast";

export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const draft = location.state; // { ownerId, ownerName, roomId, roomTitle } when arriving from a room page

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null); // { otherUser, room, conversationId }
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const bottomRef = useRef(null);
  const socket = useRef(getSocket());

  const loadConversations = useCallback(() => {
    setLoadingList(true);
    messageApi
      .conversations()
      .then((res) => {
        setConversations(res.data.conversations);

        if (draft?.ownerId) {
          const existing = res.data.conversations.find(
            (c) => c.otherUser._id === draft.ownerId && c.room?._id === draft.roomId
          );
          setActive(
            existing || {
              otherUser: { _id: draft.ownerId, name: draft.ownerName },
              room: draft.roomId ? { _id: draft.roomId, title: draft.roomTitle } : null,
            }
          );
        } else if (res.data.conversations.length > 0) {
          setActive((prev) => prev || res.data.conversations[0]);
        }
      })
      .finally(() => setLoadingList(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!active?.otherUser?._id) return;
    setLoadingThread(true);
    messageApi
      .get(active.otherUser._id, active.room?._id)
      .then((res) => {
        setMessages(res.data.messages);
        socket.current.emit("joinConversation", res.data.conversationId);
      })
      .finally(() => setLoadingThread(false));
  }, [active]);

  useEffect(() => {
    const s = socket.current;
    function handleNewMessage(msg) {
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
    }
    s.on("newMessage", handleNewMessage);
    return () => s.off("newMessage", handleNewMessage);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !active?.otherUser?._id) return;
    const body = { recipientId: active.otherUser._id, roomId: active.room?._id, text: text.trim() };
    setText("");
    try {
      const res = await messageApi.send(body);
      setMessages((prev) => [...prev, res.data.message]);
    } catch {
      toast.error("Message couldn't be sent.");
    }
  }

  if (!user) {
    return (
      <div className="container-page py-24 text-center">
        <MessageCircle className="mx-auto text-ink/20" size={40} />
        <p className="font-display text-lg text-ink mt-4">Log in to view your messages.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-6">Messages</h1>

      <div className="grid md:grid-cols-[280px_1fr] gap-6 h-[70vh] min-h-[420px]">
        <div className="card overflow-y-auto">
          {loadingList ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : conversations.length === 0 && !draft ? (
            <p className="p-5 text-sm text-slate-ink/60">
              No conversations yet. Message an owner from any room's details page to start one.
            </p>
          ) : (
            <ul className="divide-y divide-ink/6">
              {draft && !conversations.some((c) => c.otherUser._id === draft.ownerId && c.room?._id === draft.roomId) && (
                <li
                  onClick={() =>
                    setActive({
                      otherUser: { _id: draft.ownerId, name: draft.ownerName },
                      room: draft.roomId ? { _id: draft.roomId, title: draft.roomTitle } : null,
                    })
                  }
                  className="p-4 cursor-pointer bg-teal/5 hover:bg-teal/10"
                >
                  <p className="text-sm font-medium text-ink">{draft.ownerName}</p>
                  <p className="text-xs text-teal mt-0.5">New conversation · {draft.roomTitle}</p>
                </li>
              )}
              {conversations.map((c) => (
                <li
                  key={c.conversationId}
                  onClick={() => setActive(c)}
                  className={`p-4 cursor-pointer hover:bg-ink/5 ${
                    active?.conversationId === c.conversationId ? "bg-ink/5" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink truncate">{c.otherUser?.name}</p>
                    {c.unread && <span className="h-2 w-2 rounded-full bg-teal shrink-0" />}
                  </div>
                  {c.room && <p className="text-xs text-slate-ink/50 truncate mt-0.5">{c.room.title}</p>}
                  <p className="text-xs text-slate-ink/60 truncate mt-1">{c.lastMessage}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-ink/50">
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div className="border-b border-ink/8 p-4">
                <p className="text-sm font-semibold text-ink">{active.otherUser?.name}</p>
                {active.room && <p className="text-xs text-slate-ink/50">{active.room.title}</p>}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingThread ? (
                  <div className="flex justify-center py-10"><Spinner /></div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-slate-ink/50 py-10">
                    No messages yet — say hello.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isMine = m.sender === user._id || m.sender?._id === user._id;
                    return (
                      <div key={m._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                            isMine ? "bg-ink text-paper rounded-br-sm" : "bg-ink/6 text-ink rounded-bl-sm"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="border-t border-ink/8 p-3 flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field"
                />
                <button type="submit" className="btn-primary !px-4 shrink-0" aria-label="Send">
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
