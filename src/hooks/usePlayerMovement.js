import { useEffect, useCallback, useState, useRef } from "react";
import { updatePlayerPosition } from "../services/firebase";

const SPEED = 3;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;

export const usePlayerMovement = (playerId, initialX, initialY) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const positionRef = useRef({ x: initialX, y: initialY });
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
  });
  const animationFrameId = useRef(null);

  const movePlayer = useCallback(
    async (newX, newY) => {
      // Ensure player stays within boundaries
      const x = Math.max(2, Math.min(FIELD_WIDTH - 2, newX));
      const y = Math.max(2, Math.min(FIELD_HEIGHT - 2, newY));

      if (x !== positionRef.current.x || y !== positionRef.current.y) {
        positionRef.current = { x, y };
        setPosition({ x, y });

        try {
          // Update position in Firebase
          await updatePlayerPosition(playerId, x, y);
        } catch (error) {
          console.error("Error updating position:", error);
        }
      }
    },
    [playerId]
  );

  const gameLoop = useCallback(() => {
    let { x, y } = positionRef.current;
    let moved = false;

    if (keys.current.w) {
      y -= SPEED;
      moved = true;
    }
    if (keys.current.s) {
      y += SPEED;
      moved = true;
    }
    if (keys.current.a) {
      x -= SPEED;
      moved = true;
    }
    if (keys.current.d) {
      x += SPEED;
      moved = true;
    }

    if (moved) {
      movePlayer(x, y);
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [movePlayer]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        keys.current[key] = true;
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        e.preventDefault();
        keys.current[key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Start the game loop
    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameLoop]);

  return position;
};
