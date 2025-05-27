'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as lichessApi from './lichessApi';
import { LICHESS_CLIENT_ID, getLichessRedirectUri } from './lichessConfig';

// Define types for the context
interface LichessGame {
    id: string;
    state: any; // Replace 'any' with a more specific type if available
    color: 'white' | 'black'; // Refined the 'color' property to match the expected type
    fen: string; // Added the 'fen' property to represent the initial FEN of the game
}

interface UserInfo {
  id: string;
  username: string;
  title?: string;
  online: boolean;
  profile?: {
    country?: string;
  };
}

interface LichessContextType {
  accessToken: string | null;
  userInfo: UserInfo | null;
  activeLichessGame: LichessGame | null; // Added
  setActiveLichessGame: React.Dispatch<React.SetStateAction<LichessGame | null>>; // Added
  playerColorForLichessGame: 'white' | 'black' | null; // Added
  setAccessToken: (token: string) => void;
  fetchUserInfo: (token: string) => Promise<void>;
  login: () => void;
  logout: () => void;
  fetchActiveGames: () => Promise<any[]>;
  startBotGame: (options?: {
    level?: number;
    color?: 'white' | 'black' | 'random';
    timeLimit?: number;
    increment?: number;
  }) => Promise<any>; // Return type will be the game object from Lichess
  clearActiveLichessGame: () => void; // Added
  makeLichessMove: (gameId: string, move: string) => Promise<void>; // Added
  streamGameMoves: (gameId: string, onMove: (move: { from: string; to: string; promotion?: string }) => void, onGameEnd: () => void) => { close: () => void }; // Added
}

const LichessContext = createContext<LichessContextType | undefined>(undefined);

export const LichessProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setContextAccessToken] = useState<string | null>(null); // Renamed setter
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null); // Renamed setter
  const [activeLichessGame, setActiveLichessGameState] = useState<LichessGame | null>(null); // Renamed setter
  const [playerColorForLichessGame, setPlayerColorForLichessGameState] = useState<'white' | 'black' | null>(null); // Renamed setter

  // Initialize accessToken and userInfo from localStorage
  useEffect(() => {
    const token = localStorage.getItem('lichess_access_token');
    const storedUserInfo = localStorage.getItem('lichess_user_info');
    if (token) {
      setContextAccessToken(token);
    }
    if (storedUserInfo) {
      setUserInfoState(JSON.parse(storedUserInfo));
    }
    // Potentially load active game from localStorage if desired for persistence
  }, []);

  const setAccessToken = (token: string) => {
    setContextAccessToken(token);
    localStorage.setItem('lichess_access_token', token);
  };

  const login = async () => {
    const redirectUri = getLichessRedirectUri();
    await lichessApi.lichessLogin(LICHESS_CLIENT_ID, redirectUri, 'board:play');
  };

  const logout = () => {
    setContextAccessToken(null);
    setUserInfoState(null);
    setActiveLichessGameState(null); // Clear active game on logout
    setPlayerColorForLichessGameState(null); // Clear player color on logout
    localStorage.removeItem('lichess_access_token');
    localStorage.removeItem('lichess_user_info');
    localStorage.removeItem('lichess_code_verifier');
    // Potentially remove active game from localStorage
  };

  const fetchActiveGamesInternal = async () => { // Renamed
    if (!accessToken) throw new Error('User is not authenticated');
    return lichessApi.fetchActiveGames(accessToken);
  };

  const fetchUserInfoInternal = async (token: string) => { // Renamed
    const data = await lichessApi.fetchUserInfo(token);
    setUserInfoState(data);
    localStorage.setItem('lichess_user_info', JSON.stringify(data));
  };

  const startBotGameInternal = async (options: { // Renamed
    level?: number;
    color?: 'white' | 'black' | 'random';
    timeLimit?: number;
    increment?: number;
  } = {}) => {
    if (!accessToken) throw new Error('User is not authenticated');
    try {
      const gameData = await lichessApi.startBotGame(accessToken, options);
      // The Lichess API for challenging an AI returns the game object
      // which includes a 'color' field indicating the color of the player who initiated the game.
      // 'player' field indicates whose turn it is.
      // 'fen' is the initial FEN.
      const game: LichessGame = {
        id: gameData.id,
        state: gameData.state, // This is the player's color who initiated the game
        color: gameData.color, // Added the 'color' property to represent the player's color
        fen: gameData.fen, // Added the 'fen' property to represent the initial FEN of the game
      };
      setActiveLichessGameState(game);
      setPlayerColorForLichessGameState(game.color);
      console.log('Lichess game started and context updated:', game);
      return gameData; // Return the full game data as before
    } catch (error) {
      console.error('Error starting bot game in context:', error);
      throw error; // Re-throw to be caught by UI
    }
  };

  const clearActiveLichessGame = () => {
    setActiveLichessGameState(null);
    setPlayerColorForLichessGameState(null);
    // Potentially also send a request to Lichess to resign/abort if the game is ongoing
    console.log('Active Lichess game cleared from context.');
  };

  const makeLichessMove = async (gameId: string, move: string) => {
    if (!accessToken) throw new Error('User is not authenticated');
    try {
      await lichessApi.makeLichessMove(accessToken, gameId, move);
      console.log(`Move ${move} sent to Lichess for game ${gameId}`);
    } catch (error) {
      console.error('Error making move in Lichess:', error);
      throw error;
    }
  };

  const streamGameMoves = (
    gameId: string,
    onMove: (move: { from: string; to: string; promotion?: string }) => void,
    onGameEnd: () => void
  ) => {
    if (!accessToken) throw new Error('User is not authenticated');
    const stream = lichessApi.streamGameMoves(
      accessToken,
      gameId,
      (fen, move) => {
        const [from, to, promotion] = move.split('-'); // Parse the move string
        onMove({ from, to, promotion });
      },
      onGameEnd
    );
    console.log(`Streaming moves for game ${gameId}`);

    return {
      close: () => {
        if (stream && typeof stream.close === 'function') {
          stream.close();
        }
      },
    };
  };

  return (
    <LichessContext.Provider
      value={{
        accessToken,
        userInfo,
        activeLichessGame,
        setActiveLichessGame: setActiveLichessGameState, // Added
        playerColorForLichessGame,
        setAccessToken,
        fetchUserInfo: fetchUserInfoInternal,
        login,
        logout,
        fetchActiveGames: fetchActiveGamesInternal,
        startBotGame: startBotGameInternal,
        clearActiveLichessGame,
        makeLichessMove, // Added
        streamGameMoves, // Added
      }}
    >
      {children}
    </LichessContext.Provider>
  );
};

export const useLichess = () => {
  const context = useContext(LichessContext);
  if (!context) {
    throw new Error('useLichess must be used within a LichessProvider');
  }
  return context;
};

// Helper functions for PKCE
const generateCodeVerifier = () => {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ('0' + dec.toString(16)).slice(-2)).join('');
};

const generateCodeChallenge = async (codeVerifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

import { streamLichessGame } from './lichessApi';

export function useLichessGameStream() {
    const context = useContext(LichessContext);
    if (!context) {
        throw new Error('useLichessGameStream must be used within a LichessProvider');
    }

    const { activeLichessGame, setActiveLichessGame } = context;

    useEffect(() => {
        if (!activeLichessGame) return;

        const ws = streamLichessGame(activeLichessGame.id, (data: any) => {
            if (data.type === 'gameFull' || data.type === 'gameState') {
                setActiveLichessGame((prev: LichessGame | null) => ({
                    ...prev!,
                    state: data.state,
                }));
            }

            if (data.type === 'chatLine') {
                console.log('Chat message:', data);
            }
        });

        return () => {
            ws.close();
        };
    }, [activeLichessGame, setActiveLichessGame]);
}
