import { useState, useEffect } from "react";
import { subscribeToPlayers, getPlayers } from "../services/firebase";

export const useRealtimePlayers = () => {
  const [players, setPlayers] = useState({});

  useEffect(() => {
    // Initial load of players from Firebase
    getPlayers().then((initialPlayers) => {
      setPlayers(initialPlayers);
    });

    // Subscribe to Firebase for player events
    const unsubscribe = subscribeToPlayers(
      // Player added
      (playerId, playerData) => {
        setPlayers((prev) => ({
          ...prev,
          [playerId]: playerData,
        }));
      },
      // Player moved
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

    return () => {
      unsubscribe();
    };
  }, []);

  return players;
};
