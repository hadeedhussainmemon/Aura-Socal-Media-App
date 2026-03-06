import { NextApiRequest } from "next";
import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { NextApiResponseServerIo } from "@/types/socket.d";

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (_req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const httpServer: HttpServer = res.socket.server;
        const io = new SocketIOServer(httpServer, {
            path: path,
            addTrailingSlash: false,
        });
        res.socket.server.io = io;

        io.on("connection", (socket: Socket) => {
            console.log("Client connected:", socket.id);

            socket.on("join-conversation", (conversationId: string) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
            });

            socket.on("send-message", (message: { conversation: string }) => {
                // Broadcast to the conversation room
                io.to(message.conversation).emit("receive-message", message);
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
            });
        });
    }

    res.end();
};

export default ioHandler;
