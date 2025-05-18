
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface RoomContextType {
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [activeRoomId, setActiveRoomIdState] = useState<string | null>(null);

  const setActiveRoomId = useCallback((roomId: string | null) => {
    setActiveRoomIdState(roomId);
  }, []);

  return (
    <RoomContext.Provider value={{ activeRoomId, setActiveRoomId }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
