import { Server } from "socket.io";

export function setupSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(
      "User connected:",
      socket.id
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
}