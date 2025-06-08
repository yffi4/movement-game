import React, { useRef, useEffect } from "react";
import { useRealtimePlayers } from "../hooks/useRealtimePlayers";
import { usePlayerMovement } from "../hooks/usePlayerMovement";

const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const PLAYER_SIZE = 4;

const GameField = ({ playerId }) => {
  const canvasRef = useRef(null);
  const players = useRealtimePlayers();
  const animationFrameId = useRef(null);

  // Get initial position from players if exists, otherwise use center
  const initialX = players[playerId]?.x ?? FIELD_WIDTH / 2;
  const initialY = players[playerId]?.y ?? FIELD_HEIGHT / 2;

  // Use the movement hook for the current player
  usePlayerMovement(playerId, initialX, initialY);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const render = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

      // Draw grid (optional)
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 0.5;
      const gridSize = 20;

      for (let x = 0; x <= FIELD_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, FIELD_HEIGHT);
        ctx.stroke();
      }

      for (let y = 0; y <= FIELD_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(FIELD_WIDTH, y);
        ctx.stroke();
      }

      // Draw players
      Object.entries(players).forEach(([id, player]) => {
        // Draw player shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(
          player.x - PLAYER_SIZE / 2 + 1,
          player.y - PLAYER_SIZE / 2 + 1,
          PLAYER_SIZE,
          PLAYER_SIZE
        );

        // Draw player
        ctx.fillStyle = player.color;
        ctx.fillRect(
          player.x - PLAYER_SIZE / 2,
          player.y - PLAYER_SIZE / 2,
          PLAYER_SIZE,
          PLAYER_SIZE
        );

        // Draw player name
        if (player.name) {
          ctx.fillStyle = "white";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(player.name, player.x, player.y - PLAYER_SIZE - 5);
        }

        // Highlight current player
        if (id === playerId) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;
          ctx.strokeRect(
            player.x - PLAYER_SIZE / 2 - 2,
            player.y - PLAYER_SIZE / 2 - 2,
            PLAYER_SIZE + 4,
            PLAYER_SIZE + 4
          );
        }
      });

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [players, playerId]);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <canvas
        ref={canvasRef}
        width={FIELD_WIDTH}
        height={FIELD_HEIGHT}
        style={{
          border: "2px solid #333",
          backgroundColor: "#1a1a1a",
          borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
};

export default GameField;
