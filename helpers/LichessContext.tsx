'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  setAccessToken: (token: string) => void;
  fetchUserInfo: (token: string) => Promise<void>;
  login: () => void;
  logout: () => void;
  fetchActiveGames: () => Promise<any[]>;
}

const LichessContext = createContext<LichessContextType | undefined>(undefined);

export const LichessProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Initialize accessToken and userInfo from localStorage
  useEffect(() => {
    const token = localStorage.getItem('lichess_access_token');
    const storedUserInfo = localStorage.getItem('lichess_user_info');
    if (token) {
      setAccessToken(token);
    }
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const login = async () => {
    const clientId = 'YOUR_CLIENT_ID'; // Replace with your Lichess OAuth client ID
    const redirectUri = encodeURIComponent('http://localhost:3000/callback'); // Replace with your callback URL
    const scope = 'board:play';

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('lichess_code_verifier', codeVerifier);

    const authUrl = `https://lichess.org/oauth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setAccessToken(null);
    setUserInfo(null);
    localStorage.removeItem('lichess_access_token');
    localStorage.removeItem('lichess_user_info');
    localStorage.removeItem('lichess_code_verifier');
  };

  const fetchActiveGames = async () => {
    if (!accessToken) {
      throw new Error('User is not authenticated');
    }

    const response = await fetch('https://lichess.org/api/account/playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch active games');
    }

    const data = await response.json();
    return data.nowPlaying || [];
  };

  const fetchUserInfo = async (token: string) => {
    const response = await fetch('https://lichess.org/api/account', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    setUserInfo(data);
    localStorage.setItem('lichess_user_info', JSON.stringify(data)); // Store user info in localStorage
  };

  return (
    <LichessContext.Provider
      value={{
        accessToken,
        userInfo,
        setAccessToken,
        fetchUserInfo,
        login,
        logout,
        fetchActiveGames,
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
