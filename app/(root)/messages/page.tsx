import ChatList from "@/components/shared/ChatList";
import Image from "next/image";

const MessagesPage = () => {
    return (
        <div className="flex h-screen bg-dark-1 w-full overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col h-full bg-dark-1">
                <ChatList />
            </div>

            {/* Default Chat Placeholder */}
            <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-dark-2">
                <div className="p-8 rounded-full bg-dark-4 mb-6 animate-pulse">
                    <Image
                        src="/assets/icons/chat.svg"
                        alt="chat"
                        width={80}
                        height={80}
                        className="opacity-20"
                    />
                </div>
                <h2 className="text-2xl font-bold text-light-1 mb-2">Select a Conversation</h2>
                <p className="text-light-3">Chose a chat to start messaging your friends.</p>
            </div>
        </div>
    );
};

export default MessagesPage;
