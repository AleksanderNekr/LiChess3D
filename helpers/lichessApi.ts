import { LICHESS_HOST } from "./lichessConfig";
import { readStream } from "./ndJsonStream";
import { Color, GameState } from "./types";

export interface LichessUserInfo {
  id: string;
  username: string;
  title?: string;
  online: boolean;
  profile?: { country?: string };
}

export async function fetchUserInfo(token: string): Promise<LichessUserInfo> {
  const response = await fetch(`${LICHESS_HOST}/api/account`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
}

export const fetchActiveGames = async (token: string) => {
  const response = await fetch(`${LICHESS_HOST}/api/account/playing`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch active games');
  const data = await response.json();

  // Ensure each game has an ID and return the processed array
  return (data.nowPlaying || []).map((game: any) => {
    if (!game.gameId) {
      console.warn('Game without ID found:', game);
    }
    return {
      id: game.gameId || 'unknown', // Fallback to 'unknown' if ID is missing
      ...game,
    };
  });
};


export const streamGameState = (gameId: string, token: string, onUpdate: (data: GameState) => void) => {
  const path = `/api/board/game/stream/${gameId}`;
  return openStream(path, token, onUpdate, {});
}

export const startBotGame = async (
  token: string,
  options: {
    level?: number;
    color?: Color;
    timeLimit?: number; // Changed from clockLimit
    increment?: number; // Changed from clockIncrement
  } = {},
) => {
  const response = await fetch(`${LICHESS_HOST}/api/challenge/ai`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      level: String(options.level ?? 3),
      color: options.color ?? 'random',
      'clock.limit': String(options.timeLimit ?? 300),
      'clock.increment': String(options.increment ?? 0),
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('Lichess API error:', errorBody);
    throw new Error(`Failed to start bot game: ${response.statusText} - ${errorBody}`);
  }
  return response.json();
};

// PKCE helpers
export function generateCodeVerifier(): string {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, (dec) => ('0' + dec.toString(16)).slice(-2)).join('');
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Start login (redirect)
export async function lichessLogin(clientId: string, redirectUri: string, scope: string) {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem('lichess_code_verifier', codeVerifier);

  const authUrl = `${LICHESS_HOST}/oauth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  window.location.href = authUrl;
}

// Exchange code for token
export async function exchangeToken({
  code,
  clientId,
  redirectUri,
  codeVerifier,
}: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): Promise<{ access_token: string }> {
  const response = await fetch(`${LICHESS_HOST}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text(); // Get detailed error from Lichess
    console.error('Lichess token exchange error. Status:', response.status, 'Body:', errorBody); // Log it
    console.error('Token exchange request details:', { codeReceived: code, clientIdSent: clientId, redirectUriSent: redirectUri, codeVerifierSent: codeVerifier });
    throw new Error(`Failed to exchange authorization code for access token. Status: ${response.status}. Body: ${errorBody}`);
  }
  return response.json();
}

export const openStream = async (path: string, accessToken: string, handler: (msg: GameState) => void, config: any) => {
  const stream = await fetchResponse(path, accessToken, config);
  return readStream(`STREAM ${path}`, stream, handler);
};

export const makeLichessMove = async (
  token: string,
  gameId: string,
  move: string, // Move in UCI format (e.g., e2e4, e7e5)
): Promise<any> => {
  console.log(`Making Lichess move: ${move} for game ${gameId}`);
  try {
    const response = await fetch(`${LICHESS_HOST}/api/board/game/${gameId}/move/${move}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('Error making Lichess move:', response.status, errorData);
      throw new Error(`Error making Lichess move: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('Lichess move response:', responseData);
    return responseData; // Should be { ok: true } or an error
  } catch (error) {
    console.error('Network or other error in makeLichessMove:', error);
    throw error;
  }
};

const fetchResponse = async (path: string, accessToken: string, config: any = {}) => {
  const url = `${LICHESS_HOST}${path}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    ...config.headers,
  };
  const res = await fetch(url, {
    ...config,
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
    console.error('Error in fetchResponse:', res.status, errorData);
    alert(`Error in fetchResponse: ${res.status} - ${JSON.stringify(errorData)}`);
    throw new Error(`Error in fetchResponse: ${res.status} ${JSON.stringify(errorData)}`);
  }
  return res;
};

