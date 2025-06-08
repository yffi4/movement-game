import { useState, useEffect } from "react";
import { subscribeToPlayers, getPlayers } from "../services/firebase";
import { subscribeToMovements } from "../services/websocket";

export const useRealtimePlayers = () => {
  const [players, setPlayers] = useState({});

  useEffect(() => {
    // Initial load of players from Firebase
    getPlayers().then((initialPlayers) => {
      setPlayers(initialPlayers);
    });

    // Subscribe to Firebase for player join/leave events
    const firebaseCleanup = subscribeToPlayers(
      // Player added
      (playerId, playerData) => {
        setPlayers((prev) => ({
          ...prev,
          [playerId]: playerData,
        }));
      },
      // Player moved (from Firebase, for persistence)
      (playerId, playerData) => {
        setPlayers((prev) => ({
          ...prev,
          [playerId]: {
            ...prev[playerId],
            ...playerData,
          },
        }));
      },
      // Player removed
      (playerId) => {
        setPlayers((prev) => {
          const newPlayers = { ...prev };
          delete newPlayers[playerId];
          return newPlayers;
        });
      }
    );

    // Subscribe to WebSocket for real-time movement updates
    const wsCleanup = subscribeToMovements((playerId, position) => {
      setPlayers((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          ...position,
        },
      }));
    });

    return () => {
      firebaseCleanup();
      wsCleanup();
    };
  }, []);

  return players;
};
