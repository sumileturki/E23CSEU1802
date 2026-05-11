import dotenv from "dotenv";
import http from "http";

import app from "./app.ts";
import { setupSocket } from "./websocket/socket.ts";

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

setupSocket(server);

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});