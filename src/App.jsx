import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import GameField from "./components/GameField";
import PlayerList from "./components/PlayerList";
import { addPlayer, removePlayer } from "./services/firebase";

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;

function App() {
  const [playerId] = useState(() => uuidv4());
  const [playerName, setPlayerName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

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
    setError(null);

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
      setError("Failed to join the game. Please try again.");
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
          />
          {error && (
            <div
              style={{
                color: "#ff4444",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              padding: "8px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Join Game
          </button>
        </form>
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
