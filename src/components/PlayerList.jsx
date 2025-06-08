import React from "react";
import { useRealtimePlayers } from "../hooks/useRealtimePlayers";

const PlayerList = () => {
  const players = useRealtimePlayers();

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "15px",
        borderRadius: "8px",
        color: "white",
        minWidth: "200px",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>Active Players</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(players).map(([id, player]) => (
          <li
            key={id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: player.color,
                marginRight: "10px",
                borderRadius: "2px",
              }}
            />
            <span>{player.name || `Player ${id.slice(0, 4)}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerList;
