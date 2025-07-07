// src/types/player.ts
export interface PlayerInLobby {
  id: string;
  name: string;
  // Añade otras propiedades que necesites
  score?: number;
  isHost?: boolean;
  // etc...
}