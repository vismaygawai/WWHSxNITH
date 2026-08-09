import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  SendHorizonal,
  Image as ImageIcon,
  Code2,
  Smile,
  Menu,
  Paperclip,
  X,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme } from "emoji-picker-react";
import imageCompression from "browser-image-compression";

import api from "@/services/api";
import { getSocket } from "@/services/socket";
import { useAuth } from "@/hooks/use-auth";
import { ImageModal } from "@/components/ImageModal";
import { CodeModal } from "@/components/CodeModal";
import RoomSidebar from "@/components/RoomSidebar";
import { BRAND_NAME, isAdminEmail } from "@/lib/brand";

export const Route = createFileRoute("/_authenticated/rooms/$slug")({
  component: RoomChat,
});

interface ChatMessage {
  _id: string;
  text?: string;
  image?: string;
  sender: { _id: string; name: string; email: string } | string;
  room: string;
  createdAt: string;
  _optimistic?: boolean;
  _status?: "sending" | "sent" | "error";
}

function senderName(msg: ChatMessage): string {
  return typeof msg.sender === "object" ? msg.sender.name : "Member";
}

function senderId(msg: ChatMessage): string {
  return typeof msg.sender === "object" ? msg.sender._id : msg.sender;
}

function avatarUrl(id: string, email: string): string {
  const savedSeed =
    typeof localStorage !== "undefined" ? localStorage.getItem(`avatar_seed_${id}`) : null;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(savedSeed || email || "Felix")}`;
}

function senderEmail(msg: ChatMessage): string {
  return typeof msg.sender === "object" ? msg.sender.email : "";
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function dateSeparatorLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function groupMessagesWithDates(messages: ChatMessage[]) {
  const groups: { type: "date" | "message"; date?: string; message?: ChatMessage }[] = [];
  let lastDate = "";

  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== lastDate) {
      groups.push({ type: "date", date: dateSeparatorLabel(msg.createdAt) });
      lastDate = msgDate;
    }
    groups.push({ type: "message", message: msg });
  }
  return groups;
}

function RoomChat() {
  const { slug } = useParams({ from: "/_authenticated/rooms/$slug" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  // Fetch room info
  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ["room-by-slug", slug],
    queryFn: async () => {
      const { data } = await api.get("/room/allRooms");
      const rooms = data.rooms as any[];
      return rooms.find((r: any) => r.roomId === slug) ?? null;
    },
  });

  const roomId = room?._id;
  const roomTitle = room?.title ?? slug.replace(/-/g, " ");

  // Fetch messages
  useEffect(() => {
    if (!roomId) return;
    api
      .get(`/chat/chat-history/${roomId}`)
      .then(({ data }) => {
        setMessages(Array.isArray(data) ? data : (data?.messages ?? []));
      })
      .catch(() => {});
  }, [roomId]);

  // Socket.IO setup
  useEffect(() => {
    if (!roomId || !user) return;
    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("join_room", { room: roomId, userId: user._id });

    const handleMessage = (msg: ChatMessage) => {
      if (msg.room === roomId) {
        setMessages((prev) => {
          // Replace optimistic message if it exists
          const idx = prev.findIndex(
            (m) => m._optimistic && m.text === msg.text && senderId(m) === senderId(msg),
          );
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = msg;
            return next;
          }
          // Prevent duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleTyping = ({ userId: uid, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        if (isTyping) {
          next.set(uid, uid);
          // Auto-clear after 3 seconds
          setTimeout(() => {
            setTypingUsers((p) => {
              const n = new Map(p);
              n.delete(uid);
              return n;
            });
          }, 3000);
        } else {
          next.delete(uid);
        }
        return next;
      });
    };

    const handlePresence = ({ userId: uid, status }: { userId: string; status: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (status === "online") next.add(uid);
        else next.delete(uid);
        return next;
      });
    };

    const handleOnlineList = (ids: string[]) => {
      setOnlineUsers(new Set(ids));
    };

    const handleMessageDeleted = ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    };

    socket.on("receive_message", handleMessage);
    socket.on("received_message", handleMessage);
    socket.on("typing_update", handleTyping);
    socket.on("presence_update", handlePresence);
    socket.on("online_users", handleOnlineList);
    socket.on("message_deleted", handleMessageDeleted);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("received_message", handleMessage);
      socket.off("typing_update", handleTyping);
      socket.off("presence_update", handlePresence);
      socket.off("online_users", handleOnlineList);
      socket.off("message_deleted", handleMessageDeleted);
    };
  }, [roomId, user]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages.length]);

  // Typing indicator emission
  const emitTyping = useCallback(() => {
    if (!roomId || !user) return;
    const socket = getSocket();
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", { room: roomId, userId: user._id });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing_stop", { room: roomId, userId: user._id });
    }, 2000);
  }, [roomId, user]);

  // Send text message
  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !roomId || !user || sending) return;

    // Stop typing indicator
    if (isTypingRef.current) {
      getSocket().emit("typing_stop", { room: roomId, userId: user._id });
      isTypingRef.current = false;
    }

    // Optimistic insert
    const optimistic: ChatMessage = {
      _id: `opt-${Date.now()}`,
      text: body,
      sender: { _id: user._id, name: user.name, email: user.email },
      room: roomId,
      createdAt: new Date().toISOString(),
      _optimistic: true,
      _status: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    setSending(true);

    try {
      const { data: savedMsg } = await api.post(`/chat/${roomId}`, { text: body });
      setMessages((prev) => {
        // Prevent duplicate if socket beat the HTTP response
        if (prev.some((m) => m._id === savedMsg._id)) {
          return prev.filter((m) => m._id !== optimistic._id);
        }
        // Replace optimistic message
        const idx = prev.findIndex((m) => m._id === optimistic._id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = savedMsg;
          return next;
        }
        return [...prev, savedMsg];
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? { ...m, _status: "error" } : m)),
      );
      toast.error("Failed to send message");
    }
    setSending(false);
  }

  async function handleDeleteMsg(msgId: string) {
    try {
      await api.delete(`/chat/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  }

  // Send image
  async function handleImageUpload(file: File) {
    if (!roomId || !user || uploadingImage) return;

    setUploadingImage(true);
    try {
      // Compress before upload
      let compressedFile = file;
      if (file.type.startsWith("image/") && !file.type.includes("svg")) {
        try {
          compressedFile = await imageCompression(file, {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
        } catch {
          // If compression fails, use original
        }
      }

      const formData = new FormData();
      formData.append("image", compressedFile);

      const { data: savedMsg } = await api.post(`/chat/${roomId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => {
        if (prev.some((m) => m._id === savedMsg._id)) return prev;
        return [...prev, savedMsg];
      });
      setImagePreview(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to upload image";
      toast.error(msg);
    } finally {
      setUploadingImage(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview({ file, url });
    setShowAttach(false);
    e.target.value = "";
  }

  function handleCodeSend(code: string) {
    if (!roomId || !user) return;
    const body = "```\n" + code + "\n```";
    setDraft("");
    api
      .post(`/chat/${roomId}`, { text: body })
      .then(({ data: savedMsg }) => {
        setMessages((prev) => {
          if (prev.some((m) => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
      })
      .catch(() => toast.error("Failed to send code"));
    setShowCode(false);
  }

  // Emoji select
  function handleEmojiClick(emojiData: any) {
    setDraft((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  }

  const grouped = useMemo(() => groupMessagesWithDates(messages), [messages]);

  // Typing indicator display
  const typingList = Array.from(typingUsers.keys()).filter((uid) => uid !== user?._id);

  if (roomLoading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }
  if (!room) {
    return (
      <div className="px-4 md:px-8 py-16 text-center">
        <p className="text-white/60">This room doesn't exist.</p>
        <Link
          to="/rooms"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(var(--app-height,100dvh)-var(--safe-top,0px))] md:h-[calc(100dvh-1.5rem)]">
      {/* Room Sidebar */}
      <RoomSidebar open={showSidebar} onClose={() => setShowSidebar(false)} />

      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-8 py-3 border-b border-border">
        <button
          type="button"
          onClick={() => setShowSidebar(true)}
          className="md:hidden -ml-1 grid size-9 place-items-center rounded-full bg-white/5 text-white/70"
        >
          <Menu className="size-4" />
        </button>
        <Link
          to="/rooms"
          className="hidden md:grid -ml-1 size-9 place-items-center rounded-full bg-white/5 text-white/70"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="grid size-9 place-items-center rounded-2xl bg-primary/15 text-lg ring-1 ring-primary/25">
          #
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white leading-tight truncate">{roomTitle}</div>
          {room.description && (
            <div className="text-xs text-white/45 truncate">{room.description}</div>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-white/35">
          <span className="size-2 rounded-full bg-emerald-400 inline-block" />
          {onlineUsers.size} online
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 space-y-3">
        {messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-white/45">
            No messages yet — say something first.
          </p>
        ) : (
          grouped.map((item, i) => {
            if (item.type === "date") {
              return (
                <div key={`date-${i}`} className="flex items-center gap-3 py-2">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="text-[11px] text-white/35 font-medium">{item.date}</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
              );
            }
            const m = item.message!;
            const mine = senderId(m) === user?._id;
            const name = senderName(m);
            const email = senderEmail(m);
            const isSenderAdmin = isAdminEmail(email);
            const currentUserIsAdmin = isAdminEmail(user?.email);
            const canDelete = mine || currentUserIsAdmin;

            return (
              <div key={m._id} className={`group flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                <img
                  src={avatarUrl(senderId(m), email || name)}
                  alt=""
                  className={`size-8 shrink-0 rounded-full object-cover bg-primary/10 ${onlineUsers.has(senderId(m)) ? "ring-2 ring-emerald-400/60" : ""}`}
                />
                <div className={`max-w-[min(34rem,80%)] ${mine ? "text-right" : ""}`}>
                  <div
                    className="flex items-center gap-1.5 text-[11px] text-white/40"
                    style={{ justifyContent: mine ? "flex-end" : "flex-start" }}
                  >
                    <span className="font-medium text-white/60">{mine ? "You" : name}</span>
                    {isSenderAdmin && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-400 border border-amber-500/30">
                        <ShieldCheck className="size-2.5" /> Admin
                      </span>
                    )}
                    <span>{timeLabel(m.createdAt)}</span>
                    {m._status === "sending" && (
                      <Loader2 className="size-3 animate-spin text-white/30" />
                    )}
                    {m._status === "error" && (
                      <span className="text-destructive text-[10px]">Failed</span>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMsg(m._id)}
                        title="Delete message"
                        className="ml-1 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive p-0.5"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                  {(m.image || (m.imageURL && m.imageURL.trim().length > 1)) && (
                    <button
                      type="button"
                      onClick={() => setViewImage(m.image || m.imageURL!)}
                      className="mt-1 block"
                    >
                      <img
                        src={m.image || m.imageURL}
                        alt=""
                        className={`max-w-[16rem] rounded-2xl border border-border object-cover cursor-pointer hover:opacity-90 transition-opacity ${mine ? "rounded-tr-md" : "rounded-tl-md"}`}
                      />
                    </button>
                  )}
                  {m.text && (
                    <div
                      className={`mt-1 inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                        mine
                          ? "bg-primary text-primary-foreground rounded-tr-md"
                          : "bg-card text-white/90 border border-border rounded-tl-md"
                      }`}
                    >
                      {m.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {typingList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-white/40"
          >
            <span className="flex gap-0.5">
              <span className="size-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0ms]" />
              <span className="size-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:150ms]" />
              <span className="size-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:300ms]" />
            </span>
            Someone is typing…
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-4 md:px-8 pb-2"
          >
            <div className="relative inline-block rounded-2xl border border-border bg-card p-2">
              <img src={imagePreview.url} alt="" className="max-h-32 rounded-xl object-contain" />
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(imagePreview.url);
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground text-xs"
              >
                <X className="size-3" />
              </button>
              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => handleImageUpload(imagePreview.file)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50 transition-opacity"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Uploading…
                  </>
                ) : (
                  "Send Image"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="px-4 md:px-8 pb-2"
          >
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={handleEmojiClick}
              width="100%"
              height={320}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <form
        onSubmit={send}
        className="sticky bottom-0 px-4 md:px-8 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pb-4 pt-3 bg-background/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none"
      >
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-2 backdrop-blur-xl">
          {/* Attachment menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAttach(!showAttach);
                setShowEmoji(false);
              }}
              className="grid size-9 shrink-0 place-items-center rounded-full text-white/45 hover:text-white/70 hover:bg-white/5"
            >
              <Paperclip className="size-4" />
            </button>
            <AnimatePresence>
              {showAttach && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute bottom-12 left-0 flex gap-1 rounded-2xl border border-border bg-card p-1.5 backdrop-blur-xl shadow-lg"
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white/60 hover:bg-white/5"
                  >
                    <ImageIcon className="size-3.5" /> Image
                  </button>
                  {roomTitle.toLowerCase().includes("tech") && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCode(true);
                        setShowAttach(false);
                      }}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white/60 hover:bg-white/5"
                    >
                      <Code2 className="size-3.5" /> Code
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            onClick={() => {
              setShowEmoji(!showEmoji);
              setShowAttach(false);
            }}
            className="grid size-9 shrink-0 place-items-center rounded-full text-white/45 hover:text-white/70 hover:bg-white/5"
          >
            <Smile className="size-4" />
          </button>

          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              emitTyping();
            }}
            placeholder={`Message #${roomTitle}`}
            maxLength={4000}
            className="flex-1 bg-transparent px-3 text-sm text-white placeholder:text-white/35 outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send message"
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4" />
            )}
          </button>
        </div>
      </form>

      {/* Code Modal */}
      <CodeModal open={showCode} onClose={() => setShowCode(false)} onSend={handleCodeSend} />

      {/* Image Viewer Modal */}
      <ImageModal src={viewImage ?? ""} open={!!viewImage} onClose={() => setViewImage(null)} />
    </div>
  );
}
