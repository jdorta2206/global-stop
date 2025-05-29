"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Assuming this is the interface you want to export
export interface RoomGameContextValue {
    // Add the actual properties of your RoomGameContextValue here
    gameData: any; // Replace 'any' with the actual type
    connectedPlayers: any[]; // Replace 'any' with the actual type
    isEvaluatingByHost: boolean;
    setIsEvaluatingByHost: (isEvaluating: boolean) => void;
    resetGame: () => void; // Assuming there is a resetGame function
}

export const RoomGameContext = createContext<RoomGameContextValue | undefined>(undefined);

interface RoomGameProviderProps {
    children: ReactNode;
}

export function RoomGameProvider({ children }: RoomGameProviderProps) {
    const [gameData, setGameData] = useState<any>(null); // Replace 'any' with the actual type
    const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]); // Replace 'any' with the actual type
    const [isEvaluatingByHost, setIsEvaluatingByHost] = useState(false);

    const resetGame = useCallback(() => {
        // Implement game reset logic here
        setGameData(null);
        setConnectedPlayers([]);
        setIsEvaluatingByHost(false);
    }, []);

    return (
        <RoomGameContext.Provider value={{ gameData, connectedPlayers, isEvaluatingByHost, setIsEvaluatingByHost, resetGame }}>
            {children}
        </RoomGameContext.Provider>
    );
}

export function useRoomGameContext() {
    const context = useContext(RoomGameContext);
    if (context === undefined) {
        throw new Error('useRoomGameContext must be used within a RoomGameProvider');
    }
    return context;
}