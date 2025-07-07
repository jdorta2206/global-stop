import React, { createContext, useContext, ReactNode } from 'react';
import { PlayerInLobby } from '@/types/player'; // Importa desde tu archivo de tipos

export interface RoomGameContextValue {
  activeRoomId: string | null;
  setActiveRoomId: React.Dispatch<React.SetStateAction<string | null>>;
  gameData: any;
  connectedPlayers: PlayerInLobby[];
  isEvaluatingByHost: boolean;
  setIsEvaluatingByHost: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultContextValue: RoomGameContextValue = {
  activeRoomId: null,
  setActiveRoomId: () => {},
  gameData: null,
  connectedPlayers: [],
  isEvaluatingByHost: false,
  setIsEvaluatingByHost: () => {},
};

export const RoomGameContext = createContext<RoomGameContextValue>(defaultContextValue);

export const useRoomGameContext = () => {
  const context = useContext(RoomGameContext);
  if (context === undefined) {
    throw new Error('useRoomGameContext must be used within a RoomGameProvider');
  }
  return context;
};

interface RoomGameProviderProps {
  children: ReactNode;
}

export const RoomGameProvider: React.FC<RoomGameProviderProps> = ({ children }) => {
  const contextValue: RoomGameContextValue = defaultContextValue;

  return (
    <RoomGameContext.Provider value={contextValue}>
      {children}
    </RoomGameContext.Provider>
  );
};