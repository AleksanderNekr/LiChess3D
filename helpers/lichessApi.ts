import { Chess } from 'chess.js';

export interface LichessUserInfo {
  id: string;
  username: string;
  title?: string;
  online: boolean;
  profile?: { country?: string };
}

export async function fetchUserInfo(token: string): Promise<LichessUserInfo> {
  const response = await fetch('https://lichess.org/api/account', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch user info');
  return response.json();
}

export const fetchActiveGames = async (token: string) => {
  const response = await fetch('https://lichess.org/api/account/playing', {
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

export const startBotGame = async (
  token: string,
  options: {
    level?: number;
    color?: 'white' | 'black' | 'random';
    timeLimit?: number; // Changed from clockLimit
    increment?: number; // Changed from clockIncrement
  } = {},
) => {
  const response = await fetch('https://lichess.org/api/challenge/ai', {
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

export const makeLichessMove = async (
  token: string,
  gameId: string,
  move: string, // Move in UCI format (e.g., e2e4, e7e5)
): Promise<any> => {
  console.log(`Making Lichess move: ${move} for game ${gameId}`);
  try {
    const response = await fetch(`https://lichess.org/api/board/game/${gameId}/move/${move}`, {
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

export const streamGameMoves = (
  token: string,
  gameId: string,
  onMove: (fen: string, move: string) => void,
  onGameEnd: () => void
) => {
  const controller = new AbortController();
  const { signal } = controller;

  fetch(`https://lichess.org/api/board/game/stream/${gameId}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to stream game moves: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      const chess = new Chess();

      if (!reader) {
        console.error('No reader available for the response body');
        return;
      }

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const event = JSON.parse(line);

            if (event.type === 'gameFull') {
              if (event.state?.fen) {
                chess.load(event.state.fen);
                onMove(event.state.fen, '');
              } else {
                console.warn('Missing FEN in gameFull event:', event);
              }
            } else if (event.type === 'gameState') {
              if (event.fen) {
                chess.load(event.fen);
                const lastMove = event.moves?.split(' ').pop() || '';
                onMove(event.fen, lastMove);
              } else {
                console.warn('Missing FEN in gameState event:', event);
              }
            } else if (event.type === 'gameFinish') {
              onGameEnd();
              return;
            }
          } catch (error) {
            console.error('Error parsing event line:', line, error);
          }
        }
      }
    })
    .catch((error) => {
      if (signal.aborted) {
        console.log('Stream aborted');
      } else {
        console.error('Error in streamGameMoves:', error);
      }
    });

  return {
    close: () => controller.abort(),
  };
};

export function streamLichessGame(
  gameId: string,
  onMessage: (data: any) => void
) {
  const url = `wss://lichess.org/api/board/game/stream/${gameId}`;
  const token = process.env.LICHESS_API_TOKEN; // Ensure the token is set in your environment

  const ws = new WebSocket(url);

  ws.onopen = () => {
    ws.send(JSON.stringify({ Authorization: `Bearer ${token}` }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
  };

  return ws;
}

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
export async function lichessLogin(clientId: string, redirectUri: string, scope: string = 'board:play') {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  localStorage.setItem('lichess_code_verifier', codeVerifier);

  const authUrl = `https://lichess.org/oauth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
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
  const response = await fetch('https://lichess.org/api/token', {
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
