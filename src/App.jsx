import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import GameField from "./components/GameField";
import PlayerList from "./components/PlayerList";
import { addPlayer, removePlayer } from "./services/firebase";
import { connectWebSocket } from "./services/websocket";
import { usePlayerMovement } from "./hooks/usePlayerMovement";

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;

function App() {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 2000; // 2 seconds

    const tryConnect = () => {
      setIsConnecting(true);
      setConnectionError(null);

      connectWebSocket()
        .then(() => {
          setIsConnecting(false);
          setConnectionError(null);
          retryCount = 0;
        })
        .catch((error) => {
          console.error("Connection error:", error);
          setConnectionError("Failed to connect to game server");

          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryConnect, retryInterval);
          } else {
            setIsConnecting(false);
          }
        });
    };

    tryConnect();
  }, []);

  const getRandomColor = () => {
    const colors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleStartGame = async (e) => {
    e.preventDefault();
    if (isConnecting || connectionError) {
      return;
    }

    try {
      const initialX = Math.floor(Math.random() * (FIELD_WIDTH - 10) + 5);
      const initialY = Math.floor(Math.random() * (FIELD_HEIGHT - 10) + 5);

      await addPlayer(playerId, {
        name: playerName || `Player ${playerId.slice(0, 4)}`,
        color: getRandomColor(),
        x: initialX,
        y: initialY,
      });

      setIsPlaying(true);
    } catch (error) {
      console.error("Error starting game:", error);
      setConnectionError("Failed to join the game. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      if (isPlaying) {
        removePlayer(playerId).catch(console.error);
      }
    };
  }, [playerId, isPlaying]);

  if (!isPlaying) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
        }}
      >
        <form
          onSubmit={handleStartGame}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: "20px",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "none",
            }}
            disabled={isConnecting}
          />
          {connectionError && (
            <div
              style={{
                color: "#ff4444",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {connectionError}
            </div>
          )}
          <button
            type="submit"
            style={{
              padding: "8px",
              backgroundColor:
                isConnecting || connectionError ? "#666" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor:
                isConnecting || connectionError ? "not-allowed" : "pointer",
              position: "relative",
            }}
            disabled={isConnecting || connectionError}
          >
            {isConnecting ? "Connecting..." : "Join Game"}
            {isConnecting && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ffffff",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
          </button>
        </form>
        <style>
          {`
            @keyframes spin {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1a1a1a", minHeight: "100vh" }}>
      <GameField playerId={playerId} />
      <PlayerList />
    </div>
  );
}

export default App;
