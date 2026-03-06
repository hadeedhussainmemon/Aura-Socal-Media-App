import ChatList from "@/components/shared/ChatList";
import ChatWindow from "@/components/shared/ChatWindow";

const ConversationPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    return (
        <div className="flex h-screen bg-dark-1 w-full overflow-hidden">
            {/* Sidebar List (Hidden on mobile when chat is open) */}
            <div className="hidden md:flex w-80 lg:w-96 border-r border-white/5 flex flex-col h-full bg-dark-1">
                <ChatList activeConversationId={id} />
            </div>

            {/* Chat Area */}
            <div className="flex-1 h-full">
                <ChatWindow conversationId={id} />
            </div>
        </div>
    );
};

export default ConversationPage;
