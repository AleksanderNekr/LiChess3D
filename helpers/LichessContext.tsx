'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as lichessApi from './lichessApi';
import { LICHESS_CLIENT_ID, getLichessRedirectUri, scope } from './lichessConfig';
import { GameState, GameFullEvent, UserInfo } from './types';
import { LichessGame } from './LichessGame';
import { Stream } from './ndJsonStream';
import { Chess } from 'chess.js';


interface LichessContextType {
  accessToken: string | null;
  userInfo: UserInfo | null;
  setAccessToken: (token: string) => void;
  fetchUserInfo: (token: string) => Promise<void>;
  login: () => void;
  logout: () => void;
  fetchActiveGames: () => Promise<any[]>;
  makeLichessMove: (gameId: string, move: string) => Promise<void>;
  streamGameState: (gameId: string, callback: (chessPosition: Chess) => void) => Promise<LichessGame>;
  streamStarted: string | null;
  setStreamStarted: (gameId: string) => void;
}

const LichessContext = createContext<LichessContextType | undefined>(undefined);

export const LichessProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setContextAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);
  const [streamStarted, setStreamStarted] = useState<string | null>(null);

  useEffect(() => {
    async function loadTokenAndUser() {
      const res = await fetch('/api/get-lichess-token');
      const { accessToken } = await res.json();
      if (accessToken) {
        setContextAccessToken(accessToken);
        try {
          const user = await lichessApi.fetchUserInfo(accessToken);
          setUserInfoState(user);
        } catch (e) {
          setUserInfoState(null);
        }
      } else {
        setContextAccessToken(null);
        setUserInfoState(null);
      }
    }
    loadTokenAndUser();
  }, []);

  const setAccessToken = (token: string) => {
    setContextAccessToken(token);
  };

  const login = async () => {
    await lichessApi.lichessLogin(LICHESS_CLIENT_ID, getLichessRedirectUri(), scope);
  };

  const logout = () => {
    setContextAccessToken(null);
    setUserInfoState(null);

    fetch('/api/set-lichess-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: '' }),
    });
  };

  const fetchActiveGamesInternal = async () => {
    if (!accessToken) throw new Error('User is not authenticated');
    return lichessApi.fetchActiveGames(accessToken);
  };

  const fetchUserInfoInternal = async (token: string) => {
    const data = await lichessApi.fetchUserInfo(token);
    setUserInfoState(data);
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

  const streamGameState = (gameId: string, callback: (chessPosition: Chess) => void) => {
    if (!accessToken || !userInfo?.id) throw new Error('User is not authenticated');

    return new Promise<LichessGame>(async resolve => {
      let game: LichessGame;
      let stream: Stream;


      const handler = (msg: GameState) => {
        if (game) {
          game.handleStateChange(msg);
        } else {
          game = new LichessGame(msg as GameFullEvent, stream, userInfo.id, callback);
          resolve(game);
        }
      };

      stream = await lichessApi.streamGameState(gameId, accessToken, handler);
    })
  };


  return (
    <LichessContext.Provider
      value={{
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        userInfo: userInfo,
        fetchUserInfo: fetchUserInfoInternal,
        login: login,
        logout: logout,
        fetchActiveGames: fetchActiveGamesInternal,
        makeLichessMove: makeLichessMove,
        streamGameState: streamGameState,
        streamStarted: streamStarted,
        setStreamStarted: setStreamStarted,
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
