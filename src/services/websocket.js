let ws = null;
let messageHandlers = new Map();
let reconnectTimeout = null;

export const connectWebSocket = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return Promise.resolve(ws);
  }

  return new Promise((resolve, reject) => {
    try {
      ws = new WebSocket("ws://localhost:3001/ws");

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const handlers = messageHandlers.get(data.type) || [];
          handlers.forEach((handler) => handler(data));
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        // Clear existing timeout if any
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        // Attempt to reconnect after 1 second
        reconnectTimeout = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connectWebSocket()
            .then(() => console.log("Reconnected successfully"))
            .catch((error) => console.error("Reconnection failed:", error));
        }, 1000);
      };

      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
        resolve(ws);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    } catch (error) {
      console.error("Error creating WebSocket:", error);
      reject(error);
    }
  });
};

// This function now only broadcasts movement through WebSocket
export const broadcastMovement = (playerId, x, y) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(
        JSON.stringify({
          type: "move",
          playerId,
          x,
          y,
        })
      );
    } catch (error) {
      console.error("Error sending movement:", error);
    }
  }
};

// Subscribe to real-time movement updates only
export const subscribeToMovements = (onPlayerMoved) => {
  messageHandlers.set("player_moved", [
    (data) => {
      try {
        onPlayerMoved(data.playerId, { x: data.x, y: data.y });
      } catch (error) {
        console.error("Error handling movement:", error);
      }
    },
  ]);

  return () => {
    messageHandlers.delete("player_moved");
  };
};

export const cleanup = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }

  messageHandlers.clear();
};
