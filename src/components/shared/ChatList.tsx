"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useGetConversations } from "@/lib/react-query/queriesAndMutations";
import Loader from "./Loader";
import { IConversation, IUser } from "@/types";

type ChatListProps = {
    activeConversationId?: string;
};

const ChatList = ({ activeConversationId }: ChatListProps) => {
    const { data: session } = useSession();
    const userId = session?.user?.id || (session?.user as { _id?: string })?._id || "";
    const { data: conversations, isLoading } = useGetConversations(userId);

    if (isLoading) {
        return (
            <div className="flex-center w-full h-full p-10">
                <Loader />
            </div>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="p-4 rounded-full bg-dark-4 mb-4">
                    <Image
                        src="/assets/icons/chat.svg"
                        alt="chat"
                        width={40}
                        height={40}
                        className="opacity-20"
                    />
                </div>
                <p className="text-light-3 text-sm">No conversations yet.</p>
                <p className="text-light-4 text-xs mt-1">Message someone from their profile!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col overflow-y-auto custom-scrollbar h-full">
            <div className="p-5 border-b border-white/5">
                <h2 className="text-xl font-bold text-light-1">Messages</h2>
            </div>

            <div className="flex-1">
                {conversations.map((conversation: IConversation) => {
                    const otherParticipant = conversation.participants.find(
                        (p: IUser) => (p._id || p.id) !== userId
                    );

                    if (!otherParticipant) return null;

                    const isActive = activeConversationId === conversation._id;

                    return (
                        <Link
                            key={conversation._id}
                            href={`/messages/${conversation._id}`}
                            className={`flex items-center gap-3 p-4 transition-all hover:bg-white/5 ${isActive ? "bg-white/5 border-r-2 border-primary-500" : ""
                                }`}
                        >
                            <div className="relative">
                                <Image
                                    src={
                                        otherParticipant.imageUrl ||
                                        "/assets/icons/profile-placeholder.svg"
                                    }
                                    alt="avatar"
                                    width={48}
                                    height={48}
                                    className="rounded-full h-12 w-12 object-cover border border-white/10"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-2" />
                            </div>

                            <div className="flex flex-col flex-1 overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-light-1 truncate">
                                        {otherParticipant.name}
                                    </p>
                                    <span className="text-[10px] text-light-4">
                                        {new Date(conversation.updatedAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                                <p className={`text-xs truncate ${isActive ? 'text-light-2' : 'text-light-4'}`}>
                                    {conversation.lastMessageText || "Sent a message"}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatList;
