import React, { createContext, useContext, ReactNode } from 'react';

// Assuming PlayerInLobby is defined in the game page file
import type { PlayerInLobby } from '../app/room/[roomId]/page';

// Define a basic type for the context value
export interface RoomGameContextValue {
  activeRoomId: string | null;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  gameData: any; // Consider defining a more specific type for gameData
  connectedPlayers: PlayerInLobby[];
  isEvaluatingByHost: boolean;
  setIsEvaluatingByHost: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create the context with a default value
const defaultContextValue: RoomGameContextValue = {
  activeRoomId: null,
  setActiveRoomId: () => {},
  gameData: null, // Assuming null is a reasonable default for gameData
  connectedPlayers: [],
  isEvaluatingByHost: false,
  setIsEvaluatingByHost: () => {},
};

export const RoomGameContext = createContext<RoomGameContextValue>(defaultContextValue);

// Create a custom hook to use the context
export const useRoomGameContext = () => {
  const context = useContext(RoomGameContext);
  if (context === undefined) {
    throw new Error('useRoomGameContext must be used within a RoomGameProvider');
  }
  return context;
};

// Define the props for the Provider
interface RoomGameProviderProps {
  children: ReactNode;
  // You might add value prop here if the context value is dynamic
}

// Create a provider component (optional but good practice)
export const RoomGameProvider: React.FC<RoomGameProviderProps> = ({ children }) => {
  // Here you would manage the actual state/data for the context
  const contextValue: RoomGameContextValue = defaultContextValue; // Replace with actual state

  return (
    <RoomGameContext.Provider value={contextValue}>
      {children}
    </RoomGameContext.Provider>
  );
};
