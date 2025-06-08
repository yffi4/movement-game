import express from "express";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({
  server,
  path: "/ws",
});

// Store connected clients
const clients = new Set();

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.add(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log("Received message:", data);

      if (data.type === "move") {
        // Broadcast movement to all other clients
        broadcast(
          {
            type: "player_moved",
            playerId: data.playerId,
            x: data.x,
            y: data.y,
          },
          ws
        );
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

function broadcast(message, exclude = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client !== exclude && client.readyState === 1) {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error("Error broadcasting message:", error);
      }
    }
  });
}

// Add a health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
