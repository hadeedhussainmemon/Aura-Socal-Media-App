import Image from "next/image";

const DUMMY_STORIES = [
    { id: 1, name: "Alex", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop", isLive: true },
    { id: 2, name: "Dinmark", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", isLive: false },
    { id: 3, name: "Smith", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", isLive: false },
    { id: 4, name: "Rumen", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop", isLive: false },
    { id: 5, name: "Sarah", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop", isLive: true },
    { id: 6, name: "John", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", isLive: false },
];

const StoryList = () => {
    return (
        <div className="flex items-center gap-5 overflow-x-auto py-4 px-2 no-scrollbar">
            {DUMMY_STORIES.map((story) => (
                <div key={story.id} className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
                    <div className="relative">
                        <div className={`p-[3px] rounded-full bg-gradient-to-tr from-[#7928CA] to-[#FF0080] group-hover:scale-105 transition-transform duration-300 ${story.isLive ? 'shadow-[0_0_15px_rgba(255,0,128,0.5)] animate-pulse' : ''}`}>
                            <div className="rounded-full p-[2px] bg-dark-1">
                                <Image
                                    src={story.image}
                                    alt={story.name}
                                    width={64}
                                    height={64}
                                    className="rounded-full h-16 w-16 object-cover"
                                />
                            </div>
                        </div>
                        {story.isLive && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-[8px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-tighter border-2 border-dark-1 h-4 flex items-center justify-center">
                                Live
                            </div>
                        )}
                    </div>
                    <p className="text-[11px] font-medium text-light-3/90 tracking-tight group-hover:text-light-1">
                        {story.name}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default StoryList;
