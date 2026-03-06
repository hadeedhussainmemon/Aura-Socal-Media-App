"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useGetMessages, useSendMessage } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import { Button } from "../ui/button";
import { IMessage } from "@/types";

type ChatWindowProps = {
    conversationId: string;
};

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
    const { data: session } = useSession();
    const userId = session?.user?.id || (session?.user as { _id?: string })?._id || "";
    const { data: messages, isLoading } = useGetMessages(conversationId);
    const { mutate: sendMsg, isPending: isSending } = useSendMessage();

    const [content, setContent] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !userId || isSending) return;

        const receiverId = messages?.find((m: IMessage) => (m.sender._id || m.sender.id) !== userId)?.sender._id ||
            messages?.find((m: IMessage) => m.receiver !== userId)?.receiver;

        if (!receiverId || typeof receiverId !== 'string') {
            console.error("Could not find receiver ID");
            return;
        }

        sendMsg({
            senderId: userId,
            receiverId,
            content,
        });

        setContent("");
    };

    if (isLoading) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    const otherParticipant = messages?.[0]?.sender._id === userId
        ? { name: "Chat", imageUrl: "/assets/icons/profile-placeholder.svg" }
        : messages?.[0]?.sender;

    return (
        <div className="flex flex-col h-full bg-dark-2">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between glass-morphism">
                <div className="flex items-center gap-3">
                    <Image
                        src={otherParticipant?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="rounded-full h-8 w-8 object-cover border border-white/10"
                    />
                    <h3 className="font-bold text-light-1">{otherParticipant?.name || "Chat"}</h3>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-light-3" />
                    <span className="text-light-3">
                        Encrypted
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar"
            >
                {!messages || messages.length === 0 ? (
                    <div className="flex-center h-full text-light-4 text-sm italic">
                        Start the conversation...
                    </div>
                ) : (
                    messages.map((message: IMessage) => {
                        const isMine = (message.sender._id || message.sender.id) === userId;

                        return (
                            <div
                                key={message._id}
                                className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMine
                                        ? "bg-primary-500 text-white rounded-tr-none"
                                        : "bg-dark-4 text-light-1 rounded-tl-none border border-white/5"
                                        }`}
                                >
                                    <p>{message.content}</p>
                                    <span className={`text-[9px] mt-1 block ${isMine ? 'text-white/70' : 'text-light-4'}`}>
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSend}
                className="p-4 border-t border-white/5 bg-dark-3 flex gap-2"
            >
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-dark-4 border-none rounded-full px-4 text-sm text-light-1 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
                />
                <Button
                    type="submit"
                    disabled={!content.trim() || isSending}
                    className="shad-button_primary rounded-full px-6 text-sm font-semibold h-10"
                >
                    {isSending ? "..." : "Send"}
                </Button>
            </form>
        </div>
    );
};

export default ChatWindow;
