import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  update,
  get,
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: "https://pixel-game-e8256-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export const addPlayer = async (playerId, playerData) => {
  const playerRef = ref(db, `players/${playerId}`);
  await set(playerRef, playerData);
  onDisconnect(playerRef).remove();
  return playerData;
};

export const updatePlayerPosition = async (playerId, x, y) => {
  const playerRef = ref(db, `players/${playerId}`);
  await update(playerRef, { x, y });
};

export const getPlayers = async () => {
  const playersRef = ref(db, "players");
  const snapshot = await get(playersRef);
  return snapshot.val() || {};
};

export const subscribeToPlayers = (
  onPlayerAdded,
  onPlayerMoved,
  onPlayerRemoved
) => {
  const playersRef = ref(db, "players");

  const addedUnsubscribe = onChildAdded(playersRef, (snapshot) => {
    onPlayerAdded(snapshot.key, snapshot.val());
  });

  const changedUnsubscribe = onChildChanged(playersRef, (snapshot) => {
    onPlayerMoved(snapshot.key, snapshot.val());
  });

  const removedUnsubscribe = onChildRemoved(playersRef, (snapshot) => {
    onPlayerRemoved(snapshot.key);
  });

  return () => {
    addedUnsubscribe();
    changedUnsubscribe();
    removedUnsubscribe();
  };
};

export const removePlayer = async (playerId) => {
  const playerRef = ref(db, `players/${playerId}`);
  await set(playerRef, null);
};
